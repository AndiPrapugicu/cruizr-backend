import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: {
    userId: number;
    email: string;
    name: string;
  };
}

@Controller('cars')
@UseGuards(JwtAuthGuard)
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createCarDto: CreateCarDto,
  ) {
    console.log('User from request:', req.user);
    console.log('Car data received:', createCarDto);
    console.log('User ID:', req.user.userId);
    return this.carsService.create(req.user.userId, createCarDto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    console.log('Cars request from user:', req.user);
    return this.carsService.findAllByUser(req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.carsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
    @Body() updateCarDto: UpdateCarDto,
  ) {
    return this.carsService.update(id, req.user.userId, updateCarDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.carsService.remove(id, req.user.userId);
  }

  @Post('upload-photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          console.log('Setting destination for file upload');
          cb(null, './uploads/photos');
        },
        filename: (req, file, cb) => {
          console.log('Generating filename for:', file?.originalname);
          const ext = path.extname(file?.originalname || '.jpg');
          const filename = uuidv4() + ext;
          console.log('Generated filename:', filename);
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        console.log('File filter check:', file?.mimetype);
        if (file?.mimetype?.startsWith('image/')) {
          cb(null, true);
        } else {
          console.log('Rejecting file - not an image');
          cb(new Error('Only image files are allowed'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ) {
    console.log('=== UPLOAD PHOTO ENDPOINT HIT ===');
    console.log('User from request:', req.user);
    console.log('File received:', file);
    console.log('File properties:', file ? Object.keys(file) : 'No file');

    if (!file) {
      console.log('ERROR: No file received');
      throw new Error('No file received');
    }

    const url = `/uploads/photos/${file.filename}`;
    console.log('Returning URL:', url);
    return { url };
  }

  @Post('upload-photo-base64')
  @UseGuards(JwtAuthGuard)
  uploadPhotoBase64(
    @Body() body: { imageData: string },
    @Request() req: AuthenticatedRequest,
  ) {
    console.log('=== UPLOAD PHOTO BASE64 ENDPOINT HIT ===');
    console.log('User from request:', req.user);
    console.log('ImageData received:', body.imageData ? 'Yes' : 'No');
    console.log('ImageData length:', body.imageData?.length);

    if (!body.imageData) {
      console.log('ERROR: No image data received');
      throw new Error('No image data received');
    }

    try {
      // Extract base64 data and determine file extension
      const matches = body.imageData.match(
        /^data:image\/([a-zA-Z]+);base64,(.+)$/,
      );

      if (!matches) {
        console.log('ERROR: Invalid base64 image format');
        throw new Error('Invalid base64 image format');
      }

      const ext = matches[1]; // jpg, png, etc.
      const base64Data = matches[2];
      const filename = `${uuidv4()}.${ext}`;
      const filepath = path.join('./uploads/photos', filename);

      // Convert base64 to buffer and save to file
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filepath, buffer);

      const url = `/uploads/photos/${filename}`;
      console.log('Base64 image saved successfully:', url);
      return { url };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.log('ERROR saving base64 image:', errorMessage);
      throw new Error(`Failed to save image: ${errorMessage}`);
    }
  }

  @Post('upload-video')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          console.log('Setting destination for video upload');
          // Create videos directory if it doesn't exist
          const uploadPath = './uploads/videos';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          console.log('Generating filename for video:', file?.originalname);
          const ext = path.extname(file?.originalname || '.mp4');
          const filename = `garage-tour-${uuidv4()}${ext}`;
          console.log('Generated video filename:', filename);
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        console.log('Video file filter check:', file?.mimetype);
        if (file?.mimetype?.startsWith('video/')) {
          cb(null, true);
        } else {
          console.log('Rejecting file - not a video');
          cb(new Error('Only video files are allowed'), false);
        }
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for videos
      },
    }),
  )
  uploadGarageTourVideo(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: AuthenticatedRequest,
  ) {
    console.log('=== UPLOAD GARAGE TOUR VIDEO ENDPOINT HIT ===');
    console.log('User from request:', req.user);
    console.log('Video file received:', file);
    console.log(
      'File object details:',
      file
        ? {
            fieldname: file.fieldname,
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            size: file.size,
            filename: file.filename,
          }
        : 'NO FILE',
    );

    if (!file) {
      console.log('ERROR: No video file received');
      throw new Error('No video file received');
    }

    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    const url = `${baseUrl}/uploads/videos/${file.filename}`;
    console.log('Returning video URL:', url);
    return { url };
  }

  @Patch(':id/primary')
  setPrimary(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.carsService.setPrimary(id, req.user.userId);
  }

  // Test endpoint for video upload connectivity
  @Post('test-upload')
  @UseGuards(JwtAuthGuard)
  testUploadEndpoint(@Request() req: AuthenticatedRequest) {
    console.log('=== TEST UPLOAD ENDPOINT HIT ===');
    console.log('User from request:', req.user);
    return {
      message: 'Upload endpoint is reachable',
      user: req.user,
      timestamp: new Date().toISOString(),
    };
  }
}
