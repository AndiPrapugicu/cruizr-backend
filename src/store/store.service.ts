import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreItem, UserInventory, StoreTransaction } from './store.entity';
import { FuelService } from '../fuel/fuel.service';
import { AppGateway } from '../app.gateway';
import {
  PurchaseItemDto,
  ActivateItemDto,
  DeactivateItemDto,
  CreateStoreItemDto,
  UpdateStoreItemDto,
} from './dto/store.dto';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(StoreItem)
    private storeItemRepository: Repository<StoreItem>,
    @InjectRepository(UserInventory)
    private userInventoryRepository: Repository<UserInventory>,
    @InjectRepository(StoreTransaction)
    private storeTransactionRepository: Repository<StoreTransaction>,
    private fuelService: FuelService,
    private appGateway: AppGateway,
  ) {}

  // Store Items Management
  async createStoreItem(
    createStoreItemDto: CreateStoreItemDto,
  ): Promise<StoreItem> {
    const existingItem = await this.storeItemRepository.findOne({
      where: { itemId: createStoreItemDto.itemId },
    });

    if (existingItem) {
      throw new BadRequestException('Store item with this ID already exists');
    }

    const storeItem = this.storeItemRepository.create(createStoreItemDto);
    return this.storeItemRepository.save(storeItem);
  }

  async updateStoreItem(
    itemId: string,
    updateStoreItemDto: UpdateStoreItemDto,
  ): Promise<StoreItem> {
    const storeItem = await this.storeItemRepository.findOne({
      where: { itemId },
    });

    if (!storeItem) {
      throw new NotFoundException('Store item not found');
    }

    Object.assign(storeItem, updateStoreItemDto);
    return this.storeItemRepository.save(storeItem);
  }

  async deleteStoreItem(itemId: string): Promise<void> {
    const result = await this.storeItemRepository.delete({ itemId });
    if (result.affected === 0) {
      throw new NotFoundException('Store item not found');
    }
  }

  async getStoreItems(): Promise<StoreItem[]> {
    return this.storeItemRepository.find({
      where: { isActive: true },
      order: { category: 'ASC', price: 'ASC' },
    });
  }

  async getStoreItemsForUser(userId: number): Promise<any[]> {
    const items = await this.storeItemRepository.find({
      where: { isActive: true },
      order: { category: 'ASC', price: 'ASC' },
    });

    // Get user's inventory to check purchased items
    const userInventory = await this.getUserInventory(userId);
    const purchasedItems = new Map();
    const activeItems = new Map();
    const cooldownItems = new Map();

    // Process user inventory to get status for each item
    for (const inventoryItem of userInventory) {
      purchasedItems.set(inventoryItem.itemId, true);

      if (inventoryItem.isActive) {
        activeItems.set(inventoryItem.itemId, true);
      }

      // Check if item has cooldown (for time-based items)
      if (
        inventoryItem.expiryDate &&
        new Date(inventoryItem.expiryDate) > new Date()
      ) {
        const nextPurchaseTime = new Date(inventoryItem.expiryDate);
        cooldownItems.set(inventoryItem.itemId, nextPurchaseTime.toISOString());
      }
    }

    // Transform items with user-specific information
    return items.map((item) => ({
      id: item.itemId,
      name: item.name,
      description: item.description,
      category: item.currency,
      storeCategory: item.category, // Real category: boosts, likes, etc.
      subcategory: item.subcategory || item.category,
      price: item.price,
      currency: item.currency,
      icon: item.icon,
      features: [], // Could be populated from metadata
      duration: item.duration ? `${item.duration}h` : undefined,
      usesIncluded: item.maxUses,
      active: activeItems.has(item.itemId) || false,
      purchased: purchasedItems.has(item.itemId) || false,
      expiresAt: undefined, // Could be calculated from inventory
      cooldownUntil: (cooldownItems.get(item.itemId) as string) || undefined,
      isImplemented: this.isItemImplemented(item.itemId),
      isPermanent: item.isPermanent || false,
    }));
  }

  private isItemImplemented(itemId: string): boolean {
    // Items that are fully implemented with working backend logic
    const implementedItems = [
      'profile_frame_basic',
      'profile-boost-1h',
      'profile-boost-6h',
      'super-boost-24h',
      'spotlight-boost-1h',
      'silver-profile-frame',
      'fire-profile-frame',
      'bronze-profile-frame',
      'profile_frame_emerald',
      'profile_frame_platinum',
      'profile_frame_legendary_phoenix',
      'gold-profile-frame',
      'diamond-profile-frame',
      'rainbow-profile-frame',
      'profile_frame_premium_mystic',
      'profile_frame_premium_cosmic',
      'super-like-single',
      'super-like-3pack',
      'super-like-5pack',
      'super-like-10pack',
      'swipe-rewind-single',
      'swipe-rewind-5pack',
    ];

    return implementedItems.includes(itemId);
  }

  async getStoreItemsByCategory(category: string): Promise<StoreItem[]> {
    return this.storeItemRepository.find({
      where: { category, isActive: true },
      order: { price: 'ASC' },
    });
  }

  // New method for structured store with categories and lock status
  async getStructuredStore(userId: number): Promise<{
    fuelShop: any;
    premiumShop: any;
    userBalances: { fuel: number; premium: number };
  }> {
    // Get all store items
    const allItems = await this.storeItemRepository.find({
      where: { isActive: true },
      order: { category: 'ASC', price: 'ASC' },
    });

    // Get user's fuel wallet
    const wallet = await this.fuelService.getWallet(userId);
    const userBalances = {
      fuel: wallet.balance,
      premium: wallet.premiumBalance,
    };

    // Get user's inventory to check owned items
    const userInventory = await this.getUserInventory(userId);
    const ownedItems = new Set(userInventory.map((item) => item.itemId));

    // Helper function to determine if item is locked
    const isItemLocked = (item: StoreItem) => {
      const hasBalance =
        item.currency === 'fuel'
          ? userBalances.fuel >= item.price
          : userBalances.premium >= item.price;

      const isOwned = ownedItems.has(item.itemId);

      return {
        locked: !hasBalance && !isOwned,
        owned: isOwned,
        canAfford: hasBalance,
        reason: !hasBalance ? `Insufficient ${item.currency} points` : null,
      };
    };

    // Structure fuel shop items
    const fuelShop = {
      'visibility-boost': {
        displayName: 'Boostere de Vizibilitate',
        description: 'Crește vizibilitatea profilului tău',
        icon: '🚀',
        items: allItems
          .filter(
            (item) =>
              item.currency === 'fuel' && item.category === 'visibility-boost',
          )
          .map((item) => ({
            ...item,
            lockStatus: isItemLocked(item),
          })),
      },
      'profile-customization': {
        displayName: 'Personalizare Profil',
        description: 'Customizează-ți profilul și interfața',
        icon: '🎨',
        items: allItems
          .filter(
            (item) =>
              item.currency === 'fuel' &&
              item.category === 'profile-customization',
          )
          .map((item) => ({
            ...item,
            lockStatus: isItemLocked(item),
          })),
      },
      'social-interaction': {
        displayName: 'Interacțiuni Sociale',
        description: 'Funcții sociale și de comunitate',
        icon: '👥',
        items: allItems
          .filter(
            (item) =>
              item.currency === 'fuel' &&
              item.category === 'social-interaction',
          )
          .map((item) => ({
            ...item,
            lockStatus: isItemLocked(item),
          })),
      },
      'quick-access': {
        displayName: 'Acces Rapid',
        description: 'Funcții rapide și utile',
        icon: '⚡',
        items: allItems
          .filter(
            (item) =>
              item.currency === 'fuel' && item.category === 'quick-access',
          )
          .map((item) => ({
            ...item,
            lockStatus: isItemLocked(item),
          })),
      },
    };

    // Structure premium shop items
    const premiumShop = {
      'premium-match': {
        displayName: 'Premium Match Experience',
        description: 'Experiență de match de nivel premium',
        icon: '💎',
        items: allItems
          .filter(
            (item) =>
              item.currency === 'premium' && item.category === 'premium-match',
          )
          .map((item) => ({
            ...item,
            lockStatus: isItemLocked(item),
          })),
      },
      'advanced-customization': {
        displayName: 'Customizare Avansată',
        description: 'Opțiuni avansate de personalizare',
        icon: '🎮',
        items: allItems
          .filter(
            (item) =>
              item.currency === 'premium' &&
              item.category === 'advanced-customization',
          )
          .map((item) => ({
            ...item,
            lockStatus: isItemLocked(item),
          })),
      },
    };

    return {
      fuelShop,
      premiumShop,
      userBalances,
    };
  }

  async getStoreItemById(itemId: string): Promise<StoreItem> {
    const storeItem = await this.storeItemRepository.findOne({
      where: { itemId },
    });

    if (!storeItem) {
      throw new NotFoundException('Store item not found');
    }

    return storeItem;
  }

  // User Inventory Management
  async getUserInventory(userId: number): Promise<UserInventory[]> {
    return this.userInventoryRepository.find({
      where: { userId },
      relations: ['storeItem'],
      order: { purchaseDate: 'DESC' },
    });
  }

  async getUserInventoryItem(
    userId: number,
    itemId: string,
  ): Promise<UserInventory | null> {
    return this.userInventoryRepository.findOne({
      where: { userId, itemId },
      relations: ['storeItem'],
    });
  }

  async checkItemOwnership(userId: number, itemId: string): Promise<boolean> {
    const inventoryItem = await this.getUserInventoryItem(userId, itemId);
    return !!inventoryItem;
  }

  async checkItemActive(userId: number, itemId: string): Promise<boolean> {
    const inventoryItem = await this.getUserInventoryItem(userId, itemId);

    if (!inventoryItem || !inventoryItem.isActive) {
      return false;
    }

    // Check if item has expired
    if (inventoryItem.expiryDate && new Date() > inventoryItem.expiryDate) {
      // Auto-deactivate expired item
      await this.deactivateInventoryItem(userId, itemId);
      return false;
    }

    return true;
  }

  // Purchase System
  async purchaseItem(
    userId: number,
    purchaseItemDto: PurchaseItemDto,
  ): Promise<{
    success: boolean;
    transactionId: string;
    inventoryItem?: UserInventory;
  }> {
    console.log('🛒 Store Service: purchaseItem called');
    console.log('🛒 userId:', userId);
    console.log('🛒 purchaseItemDto:', purchaseItemDto);

    const { itemId } = purchaseItemDto;
    console.log('🛒 Extracted itemId:', itemId);

    // Check if item exists
    console.log('🛒 Checking if store item exists...');
    const storeItem = await this.getStoreItemById(itemId);
    console.log('🛒 Store item found:', storeItem);

    const { price, currency } = storeItem;
    console.log('🛒 Item price:', price, 'currency:', currency);

    // Check if user already owns the item
    const existingItem = await this.getUserInventoryItem(userId, itemId);
    if (existingItem) {
      throw new BadRequestException('You already own this item');
    }

    // Check if user has enough currency
    const wallet = await this.fuelService.getWallet(userId);
    console.log('🛒 Wallet data:', wallet);
    
    // Convert to numbers for proper comparison (database returns DECIMAL as string)
    const currentBalance = Number(
      currency === 'fuel' ? wallet.balance : wallet.premiumBalance
    );
    const itemPrice = Number(price);
    
    console.log('🛒 Balance check:', {
      currency,
      currentBalance,
      price: itemPrice,
      hasEnough: currentBalance >= itemPrice,
      walletBalance: wallet.balance,
      walletPremium: wallet.premiumBalance
    });

    if (currentBalance < itemPrice) {
      console.log('❌ Insufficient balance!', { currentBalance, price: itemPrice, currency });
      throw new BadRequestException(`Insufficient ${currency} points`);
    }

    // Create transaction
    const transactionId = `store_${Date.now()}_${userId}_${itemId}`;
    const transaction = this.storeTransactionRepository.create({
      transactionId,
      userId,
      itemId,
      storeItemId: storeItem.id,
      price,
      currency,
      status: 'pending',
    });

    try {
      await this.storeTransactionRepository.save(transaction);

      // Deduct currency from user wallet (convert to number)
      if (currency === 'fuel') {
        await this.fuelService.deductFuel(userId, itemPrice);
      } else {
        await this.fuelService.deductPremiumPoints(userId, itemPrice);
      }

      // Add item to user inventory
      const expiryDate = storeItem.duration
        ? new Date(Date.now() + storeItem.duration * 60 * 60 * 1000)
        : null;

      const inventoryItemData = {
        userId: userId,
        itemId: itemId,
        storeItemId: storeItem.id,
        purchaseDate: new Date(),
        expiryDate: expiryDate || undefined,
        usesRemaining: storeItem.maxUses || undefined,
        isActive: false, // User needs to manually activate
      };

      const inventoryItem =
        this.userInventoryRepository.create(inventoryItemData);

      await this.userInventoryRepository.save(inventoryItem);

      // Update transaction status
      transaction.status = 'completed';
      await this.storeTransactionRepository.save(transaction);

      // Emit real-time update
      this.appGateway.emitToUser(userId, 'storeItemPurchased', {
        itemId,
        itemName: storeItem.name,
        price,
        currency,
        transactionId,
      });

      return {
        success: true,
        transactionId,
        inventoryItem,
      };
    } catch (error) {
      // Update transaction status to failed
      transaction.status = 'failed';
      await this.storeTransactionRepository.save(transaction);

      throw new BadRequestException(
        'Purchase failed: ' + (error as Error).message,
      );
    }
  }

  // Item Activation/Deactivation
  async activateItem(
    userId: number,
    activateItemDto: ActivateItemDto,
  ): Promise<{
    success: boolean;
    inventoryItem: UserInventory;
  }> {
    const { itemId } = activateItemDto;

    const inventoryItem = await this.getUserInventoryItem(userId, itemId);
    if (!inventoryItem) {
      throw new NotFoundException('Item not found in your inventory');
    }

    if (inventoryItem.isActive) {
      throw new BadRequestException('Item is already active');
    }

    // Check if item has expired
    if (inventoryItem.expiryDate && new Date() > inventoryItem.expiryDate) {
      throw new BadRequestException('Item has expired');
    }

    // Check if item has uses remaining
    if (
      inventoryItem.usesRemaining !== null &&
      inventoryItem.usesRemaining <= 0
    ) {
      throw new BadRequestException('Item has no uses remaining');
    }

    // Activate the item
    inventoryItem.isActive = true;
    inventoryItem.metadata = {
      ...inventoryItem.metadata,
      activatedAt: new Date(),
    };

    await this.userInventoryRepository.save(inventoryItem);

    // Emit real-time update
    this.appGateway.emitToUser(userId, 'storeItemActivated', {
      itemId,
      itemName: inventoryItem.storeItem?.name,
    });

    return {
      success: true,
      inventoryItem,
    };
  }

  async deactivateItem(
    userId: number,
    deactivateItemDto: DeactivateItemDto,
  ): Promise<{
    success: boolean;
    inventoryItem: UserInventory;
  }> {
    const { itemId } = deactivateItemDto;

    const inventoryItem = await this.getUserInventoryItem(userId, itemId);
    if (!inventoryItem) {
      throw new NotFoundException('Item not found in your inventory');
    }

    if (!inventoryItem.isActive) {
      throw new BadRequestException('Item is already inactive');
    }

    await this.deactivateInventoryItem(userId, itemId);

    // Emit real-time update
    this.appGateway.emitToUser(userId, 'storeItemDeactivated', {
      itemId,
      itemName: inventoryItem.storeItem?.name,
    });

    return {
      success: true,
      inventoryItem,
    };
  }

  private async deactivateInventoryItem(
    userId: number,
    itemId: string,
  ): Promise<void> {
    await this.userInventoryRepository.update(
      { userId, itemId },
      { isActive: false },
    );
  }

  // Purchase History
  async getPurchaseHistory(userId: number): Promise<StoreTransaction[]> {
    return this.storeTransactionRepository.find({
      where: { userId },
      relations: ['storeItem'],
      order: { timestamp: 'DESC' },
    });
  }

  async getTransactionById(transactionId: string): Promise<StoreTransaction> {
    const transaction = await this.storeTransactionRepository.findOne({
      where: { transactionId },
      relations: ['storeItem', 'user'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  // Admin Functions
  async getAllTransactions(): Promise<StoreTransaction[]> {
    return this.storeTransactionRepository.find({
      relations: ['storeItem', 'user'],
      order: { timestamp: 'DESC' },
    });
  }

  async getTransactionsByStatus(
    status: 'pending' | 'completed' | 'failed' | 'refunded',
  ): Promise<StoreTransaction[]> {
    return this.storeTransactionRepository.find({
      where: { status },
      relations: ['storeItem', 'user'],
      order: { timestamp: 'DESC' },
    });
  }

  // Utility Functions
  async canPurchaseItem(userId: number, itemId: string): Promise<boolean> {
    const storeItem = await this.getStoreItemById(itemId);

    // Check if user already owns the item
    const existingItem = await this.getUserInventoryItem(userId, itemId);
    if (existingItem) {
      return false;
    }

    // Check if user has enough currency
    const wallet = await this.fuelService.getWallet(userId);
    const currentBalance =
      storeItem.currency === 'fuel' ? wallet.balance : wallet.premiumBalance;

    return currentBalance >= storeItem.price;
  }

  async getActiveItems(userId: number): Promise<UserInventory[]> {
    const inventoryItems = await this.getUserInventory(userId);

    const activeItems: UserInventory[] = [];

    for (const item of inventoryItems) {
      if (!item.isActive) continue;

      // Check if item has expired
      if (item.expiryDate && new Date() > item.expiryDate) {
        // Auto-deactivate expired item
        await this.deactivateInventoryItem(userId, item.itemId);
        continue;
      }

      activeItems.push(item);
    }

    return activeItems;
  }

  async useItem(
    userId: number,
    itemId: string,
  ): Promise<{
    success: boolean;
    usesRemaining: number | null;
  }> {
    const inventoryItem = await this.getUserInventoryItem(userId, itemId);
    if (!inventoryItem) {
      throw new NotFoundException('Item not found in your inventory');
    }

    if (!inventoryItem.isActive) {
      throw new BadRequestException('Item is not active');
    }

    if (inventoryItem.usesRemaining !== null) {
      if (inventoryItem.usesRemaining <= 0) {
        throw new BadRequestException('Item has no uses remaining');
      }

      inventoryItem.usesRemaining -= 1;
      inventoryItem.metadata = {
        ...inventoryItem.metadata,
        totalUsed: (inventoryItem.metadata?.totalUsed || 0) + 1,
      };

      // Auto-deactivate if no uses remaining
      if (inventoryItem.usesRemaining === 0) {
        inventoryItem.isActive = false;
      }

      await this.userInventoryRepository.save(inventoryItem);
    }

    return {
      success: true,
      usesRemaining: inventoryItem.usesRemaining,
    };
  }

  async useItemByInventoryId(
    userId: number,
    inventoryId: number,
  ): Promise<{
    success: boolean;
    usesRemaining: number | null;
  }> {
    const inventoryItem = await this.userInventoryRepository.findOne({
      where: { id: inventoryId, userId },
      relations: ['storeItem'],
    });

    if (!inventoryItem) {
      throw new NotFoundException('Item not found in your inventory');
    }

    if (!inventoryItem.isActive) {
      throw new BadRequestException('Item is not active');
    }

    if (inventoryItem.usesRemaining !== null) {
      if (inventoryItem.usesRemaining <= 0) {
        throw new BadRequestException('Item has no uses remaining');
      }

      inventoryItem.usesRemaining -= 1;
      inventoryItem.metadata = {
        ...inventoryItem.metadata,
        totalUsed: (inventoryItem.metadata?.totalUsed || 0) + 1,
      };

      // Auto-deactivate if no uses remaining
      if (inventoryItem.usesRemaining === 0) {
        inventoryItem.isActive = false;
      }

      await this.userInventoryRepository.save(inventoryItem);
    }

    return {
      success: true,
      usesRemaining: inventoryItem.usesRemaining,
    };
  }

  async deleteInventoryItem(
    userId: number,
    inventoryId: number,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    // Find the inventory item belonging to this user
    const inventoryItem = await this.userInventoryRepository.findOne({
      where: { id: inventoryId, userId },
      relations: ['storeItem'],
    });

    if (!inventoryItem) {
      throw new NotFoundException('Item not found in your inventory');
    }

    // Optional: Only allow deletion of expired items
    const now = new Date();
    const isExpired =
      inventoryItem.expiryDate && new Date(inventoryItem.expiryDate) < now;

    if (!isExpired) {
      throw new BadRequestException('Only expired items can be deleted');
    }

    // Delete the inventory item
    await this.userInventoryRepository.remove(inventoryItem);

    return {
      success: true,
      message: `Item "${inventoryItem.storeItem?.name || 'Unknown'}" has been deleted from your inventory`,
    };
  }
}
