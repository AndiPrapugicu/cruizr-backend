import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Car } from './car.entity';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { BadgesService } from '../badges/badges.service';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private carsRepository: Repository<Car>,
    @Inject(forwardRef(() => BadgesService))
    private badgesService: BadgesService,
  ) {}

  async create(userId: number, createCarDto: CreateCarDto): Promise<Car> {
    console.log('Creating car with userId:', userId);
    console.log('Car DTO:', createCarDto);

    try {
      // Dacă această mașină va fi principală, setează toate celelalte ca non-principale
      if (createCarDto.isPrimary) {
        await this.carsRepository.update(
          { userId, isPrimary: true },
          { isPrimary: false },
        );
      }

      // Dacă nu există nicio mașină principală, fă aceasta principală
      const existingCars = await this.carsRepository.count({
        where: { userId },
      });
      if (existingCars === 0) {
        createCarDto.isPrimary = true;
      }

      const car = this.carsRepository.create({
        ...createCarDto,
        userId,
      });

      console.log('Car entity before save:', car);
      const savedCar = await this.carsRepository.save(car);
      console.log('Car saved successfully:', savedCar);

      // Check for badge achievements after saving car
      await this.checkCarBadges(userId, savedCar);

      return savedCar;
    } catch (error) {
      console.error('Error saving car:', error);
      throw error;
    }
  }

  async findAllByUser(userId: number): Promise<Car[]> {
    console.log('🚗 Finding cars for userId:', userId, 'type:', typeof userId);
    if (!userId || isNaN(userId)) {
      console.log('❌ Invalid userId provided to findAllByUser');
      throw new Error('Invalid userId');
    }
    const cars = await this.carsRepository.find({
      where: { userId },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
    console.log('🚗 Found cars:', cars.length, 'cars for user', userId);
    return cars;
  }

  async findOne(id: number, userId: number): Promise<Car> {
    const car = await this.carsRepository.findOne({
      where: { id, userId },
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    return car;
  }

  async update(
    id: number,
    userId: number,
    updateCarDto: UpdateCarDto,
  ): Promise<Car> {
    const car = await this.findOne(id, userId);

    // Dacă această mașină va fi principală, setează toate celelalte ca non-principale
    if (updateCarDto.isPrimary) {
      await this.carsRepository.update(
        { userId, isPrimary: true, id: Not(id) },
        { isPrimary: false },
      );
    }

    // Prevenim ca să nu rămânem fără mașină principală
    if (updateCarDto.isPrimary === false && car.isPrimary) {
      const otherCars = await this.carsRepository.count({
        where: { userId, id: Not(id) },
      });
      if (otherCars === 0) {
        throw new BadRequestException(
          'Cannot remove primary status from the only car',
        );
      }
    }

    Object.assign(car, updateCarDto);
    return this.carsRepository.save(car);
  }

  async remove(id: number, userId: number): Promise<void> {
    const car = await this.findOne(id, userId);

    // Dacă ștergem mașina principală și mai sunt alte mașini, setează prima ca principală
    if (car.isPrimary) {
      const otherCar = await this.carsRepository.findOne({
        where: { userId, id: Not(id) },
        order: { createdAt: 'ASC' },
      });
      if (otherCar) {
        await this.carsRepository.update(otherCar.id, { isPrimary: true });
      }
    }

    await this.carsRepository.remove(car);
  }

  async setPrimary(id: number, userId: number): Promise<Car> {
    const car = await this.findOne(id, userId);

    // Setează toate celelalte ca non-principale
    await this.carsRepository.update(
      { userId, isPrimary: true },
      { isPrimary: false },
    );

    // Setează aceasta ca principală
    car.isPrimary = true;
    return this.carsRepository.save(car);
  }

  async getPrimaryCar(userId: number): Promise<Car | null> {
    return this.carsRepository.findOne({
      where: { userId, isPrimary: true },
    });
  }

  async getUserCarsCount(userId: number): Promise<number> {
    return this.carsRepository.count({
      where: { userId },
    });
  }

  private async checkCarBadges(userId: number, car: Car) {
    try {
      // Check car-related badges
      await this.badgesService.checkCarBadges(userId);

      // Check modification badges
      if (car.mods && car.mods.length > 0) {
        await this.badgesService.checkModificationBadges(userId, car.id);
      }

      // Check performance badges
      if (car.horsepower) {
        await this.badgesService.checkPerformanceBadges(userId, car.horsepower);
      }

      // Check eco badges
      if (car.fuelType) {
        await this.badgesService.checkEcoBadges(userId, car.fuelType);
      }

      // Check classic car badges
      if (car.year) {
        await this.badgesService.checkClassicBadges(userId, car.year);
      }
    } catch (error) {
      console.error('Error checking car badges:', error);
      // Don't throw - badge errors shouldn't stop car creation
    }
  }
}
