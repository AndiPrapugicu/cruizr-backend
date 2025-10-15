import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoreService } from './store.service';
import {
  PurchaseItemDto,
  ActivateItemDto,
  DeactivateItemDto,
  CreateStoreItemDto,
  UpdateStoreItemDto,
} from './dto/store.dto';

// Interface for authenticated request
interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@Controller('store')
@UseGuards(JwtAuthGuard)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // Store Items Management
  @Get('items')
  async getStoreItems(@Request() req: AuthenticatedRequest) {
    return await this.storeService.getStoreItemsForUser(req.user.userId);
  }

  @Get('structured')
  async getStructuredStore(@Request() req: AuthenticatedRequest) {
    return this.storeService.getStructuredStore(req.user.userId);
  }

  @Get('items/category/:category')
  async getStoreItemsByCategory(@Param('category') category: string) {
    return this.storeService.getStoreItemsByCategory(category);
  }

  @Get('items/:itemId')
  async getStoreItemById(@Param('itemId') itemId: string) {
    return this.storeService.getStoreItemById(itemId);
  }

  @Post('items')
  async createStoreItem(@Body() createStoreItemDto: CreateStoreItemDto) {
    return this.storeService.createStoreItem(createStoreItemDto);
  }

  @Put('items/:itemId')
  async updateStoreItem(
    @Param('itemId') itemId: string,
    @Body() updateStoreItemDto: UpdateStoreItemDto,
  ) {
    return this.storeService.updateStoreItem(itemId, updateStoreItemDto);
  }

  @Delete('items/:itemId')
  async deleteStoreItem(@Param('itemId') itemId: string) {
    await this.storeService.deleteStoreItem(itemId);
    return { success: true, message: 'Item deleted successfully' };
  }

  // User Inventory Management
  @Get('inventory/:userId')
  async getUserInventory(@Param('userId', ParseIntPipe) userId: number) {
    return this.storeService.getUserInventory(userId);
  }

  @Get('inventory')
  async getMyInventory(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    return this.storeService.getUserInventory(userId);
  }

  @Get('inventory/:userId/item/:itemId')
  async getUserInventoryItem(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('itemId') itemId: string,
  ) {
    return this.storeService.getUserInventoryItem(userId, itemId);
  }

  @Get('inventory/:userId/active')
  async getActiveItems(@Param('userId', ParseIntPipe) userId: number) {
    return this.storeService.getActiveItems(userId);
  }

  @Get('my-inventory/active')
  async getMyActiveItems(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    return this.storeService.getActiveItems(userId);
  }

  // Purchase System
  @Post('purchase')
  async purchaseItem(
    @Request() req: AuthenticatedRequest,
    @Body() purchaseItemDto: PurchaseItemDto,
  ) {
    console.log('🛒 Store Controller: purchaseItem called');
    console.log('🛒 Request user:', req.user);
    console.log('🛒 Purchase DTO:', purchaseItemDto);

    const userId = req.user.userId;
    console.log('🛒 Extracted userId:', userId);

    try {
      const result = await this.storeService.purchaseItem(
        userId,
        purchaseItemDto,
      );
      console.log('🛒 Purchase result:', result);
      return result;
    } catch (error) {
      console.error('🛒 Purchase error:', error);
      throw error;
    }
  }

  @Get('can-purchase/:itemId')
  async canPurchaseItem(
    @Request() req: AuthenticatedRequest,
    @Param('itemId') itemId: string,
  ) {
    const userId = req.user.userId;
    const canPurchase = await this.storeService.canPurchaseItem(userId, itemId);
    return { canPurchase };
  }

  // Item Activation/Deactivation
  @Post('activate')
  async activateItem(
    @Request() req: AuthenticatedRequest,
    @Body() activateItemDto: ActivateItemDto,
  ) {
    const userId = req.user.userId;
    return this.storeService.activateItem(userId, activateItemDto);
  }

  @Post('deactivate')
  async deactivateItem(
    @Request() req: AuthenticatedRequest,
    @Body() deactivateItemDto: DeactivateItemDto,
  ) {
    const userId = req.user.userId;
    return this.storeService.deactivateItem(userId, deactivateItemDto);
  }

  @Post('use/:inventoryId')
  async useItem(
    @Request() req: AuthenticatedRequest,
    @Param('inventoryId', ParseIntPipe) inventoryId: number,
  ) {
    const userId = req.user.userId;
    return this.storeService.useItemByInventoryId(userId, inventoryId);
  }

  @Delete('inventory/:inventoryId')
  async deleteInventoryItem(
    @Request() req: AuthenticatedRequest,
    @Param('inventoryId', ParseIntPipe) inventoryId: number,
  ) {
    const userId = req.user.userId;
    return this.storeService.deleteInventoryItem(userId, inventoryId);
  }

  // Purchase History
  @Get('purchase-history')
  async getPurchaseHistory(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;
    return this.storeService.getPurchaseHistory(userId);
  }

  @Get('purchase-history/:userId')
  async getUserPurchaseHistory(@Param('userId', ParseIntPipe) userId: number) {
    return this.storeService.getPurchaseHistory(userId);
  }

  @Get('transaction/:transactionId')
  async getTransaction(@Param('transactionId') transactionId: string) {
    return this.storeService.getTransactionById(transactionId);
  }

  // Ownership Checks
  @Get('owns/:itemId')
  async checkItemOwnership(
    @Request() req: AuthenticatedRequest,
    @Param('itemId') itemId: string,
  ) {
    const userId = req.user.userId;
    const owns = await this.storeService.checkItemOwnership(userId, itemId);
    return { owns };
  }

  @Get('active/:itemId')
  async checkItemActive(
    @Request() req: AuthenticatedRequest,
    @Param('itemId') itemId: string,
  ) {
    const userId = req.user.userId;
    const isActive = await this.storeService.checkItemActive(userId, itemId);
    return { isActive };
  }

  // Admin endpoints (should add proper admin guard)
  @Get('admin/transactions')
  async getAllTransactions() {
    return this.storeService.getAllTransactions();
  }

  @Get('admin/transactions/:status')
  async getTransactionsByStatus(
    @Param('status') status: 'pending' | 'completed' | 'failed' | 'refunded',
  ) {
    return this.storeService.getTransactionsByStatus(status);
  }
}
