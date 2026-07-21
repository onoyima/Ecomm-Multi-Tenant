<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderItemController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\VendorProductController;
use App\Http\Controllers\Api\VendorOrderController;
use App\Http\Controllers\Api\VendorAnalyticsController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ShippingController;
use App\Http\Controllers\Api\DropshipRequestController;
use App\Http\Controllers\Api\EscrowController;
use App\Http\Controllers\Api\DisputeController;
use App\Http\Controllers\Api\CommissionController;
use App\Http\Controllers\Api\FraudAlertController;
use App\Http\Controllers\Api\PayoutController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AdminVendorController;
use App\Http\Controllers\Api\AdminDisputeController;
use App\Http\Controllers\Api\AdminRevenueController;
use App\Http\Controllers\Api\AdminProductController;
use App\Http\Controllers\Api\AIAssistantController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\ComparisonController;
use App\Http\Controllers\Api\NotificationPreferencesController;
use App\Http\Controllers\Api\HelpController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\ReturnRequestController;
use App\Http\Controllers\Api\RecentlyViewedController;
use App\Http\Controllers\Api\FlashSaleController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\GuestCheckoutController;
use App\Http\Controllers\Api\RecommendationController;
use App\Http\Controllers\Api\CurrencyController;
use App\Http\Controllers\Api\SeoController;
use App\Http\Controllers\Api\KycController;
use App\Http\Controllers\Api\PlatformWalletController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Api\LoyaltyPointController;
use App\Http\Controllers\Api\LowStockAlertController;
use App\Http\Controllers\Api\GlobalDiscountController;
use App\Http\Controllers\Api\CashbackController;
use App\Http\Controllers\Api\OrderTemplateController;
use App\Http\Controllers\Api\VendorPerformanceController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\RefundController;
use App\Http\Controllers\Api\ChargebackController;
use App\Http\Controllers\Api\PartialRefundController;
use App\Http\Controllers\Api\FrequentlyBoughtTogetherController;
use App\Http\Controllers\Api\TopRatedController;
use App\Http\Controllers\Api\AISizeFitController;
use App\Http\Controllers\Api\BulkProductImportController;
use App\Http\Controllers\Api\ABTestingController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| ShopDrop Multi-Tenant Ecommerce Platform API v1
|
*/

Route::prefix('v1')->group(function () {

    // Health check
    Route::get('health', [HealthController::class, 'index']);

    // Public auth routes (throttled)
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register'])->middleware('throttle:5,1');
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:5,1');
        Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
        Route::post('reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:3,1');

        // Social auth
        Route::get('social/{provider}/redirect', [SocialAuthController::class, 'redirect']);
        Route::get('social/{provider}/callback', [SocialAuthController::class, 'callback']);
        Route::post('social/{provider}', [SocialAuthController::class, 'tokenLogin']);
    });

    // Public product routes
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/top-rated', [TopRatedController::class, 'index']); // Must be before {id} route
    Route::get('products/frequently-bought/{productId}', [FrequentlyBoughtTogetherController::class, 'get']); // Must be before {id} route
    Route::get('products/compare', [ComparisonController::class, 'compare']); // Must be before {id} route
    Route::get('products/{id}', [ProductController::class, 'show']);
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{id}', [CategoryController::class, 'show']);
    Route::get('reviews/product/{productId}', [ReviewController::class, 'index']);
    Route::get('questions/product/{productId}', [QuestionController::class, 'index']);
    Route::get('shipping/zones', [ShippingController::class, 'zones']);
    Route::get('vendors/{id}', [VendorController::class, 'show']);
    Route::get('help/faqs', [HelpController::class, 'faqs']);
    Route::get('help/announcements', [HelpController::class, 'announcements']);
    Route::get('search/suggestions', [SearchController::class, 'suggestions']);

    // Payment webhook (no auth)
    Route::post('payments/webhook', [PaymentController::class, 'webhook']);

    // Authenticated API routes
    Route::middleware(['auth:sanctum', 'tenant'])->group(function () {

        // Auth
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        // Profile
        Route::prefix('profile')->group(function () {
            Route::get('/', [ProfileController::class, 'show']);
            Route::put('/', [ProfileController::class, 'update']);
            Route::put('password', [ProfileController::class, 'updatePassword']);
        });

        // Addresses
        Route::apiResource('addresses', AddressController::class);

        // Cart
        Route::prefix('cart')->group(function () {
            Route::get('/', [CartController::class, 'show']);
            Route::post('add', [CartController::class, 'addItem']);
            Route::put('items/{id}', [CartController::class, 'updateItem']);
            Route::delete('items/{id}', [CartController::class, 'removeItem']);
            Route::delete('/', [CartController::class, 'clear']);
        });

        // Wishlist
        Route::prefix('wishlist')->group(function () {
            Route::get('/', [WishlistController::class, 'index']);
            Route::post('toggle', [WishlistController::class, 'toggle']);
            Route::post('/', [WishlistController::class, 'add']);
            Route::delete('{id}', [WishlistController::class, 'remove']);
        });

        // Orders
        Route::prefix('orders')->middleware('throttle:30,1')->group(function () {
            Route::get('/', [OrderController::class, 'index']);
            Route::post('/', [OrderController::class, 'store']);
            Route::get('{id}', [OrderController::class, 'show']);
            Route::patch('{id}/status', [OrderController::class, 'updateStatus'])->middleware('role:vendor,admin');
            Route::post('{id}/cancel', [OrderController::class, 'cancel']);
            Route::get('{orderId}/items', [OrderItemController::class, 'index']);
            Route::get('{orderId}/items/{id}', [OrderItemController::class, 'show']);
        });

        // Reviews
        Route::prefix('reviews')->middleware('throttle:20,1')->group(function () {
            Route::post('/', [ReviewController::class, 'store']);
            Route::put('{id}', [ReviewController::class, 'update']);
            Route::delete('{id}', [ReviewController::class, 'destroy']);
        });

        // Product Questions
        Route::prefix('questions')->group(function () {
            Route::post('/', [QuestionController::class, 'store']);
            Route::post('{id}/answer', [QuestionController::class, 'answer'])->middleware('role:vendor,admin');
        });

        // Shipping
        Route::get('shipping/rates', [ShippingController::class, 'rates']);
        Route::post('shipping/track', [ShippingController::class, 'track']);

        // Wishlist
        Route::get('wishlist', [WishlistController::class, 'index']);

        // Vendor routes
        Route::prefix('vendors')->middleware('role:vendor,admin')->group(function () {
            Route::get('me', [VendorController::class, 'me']);
            Route::put('me', [VendorController::class, 'update']);
            Route::post('apply', [VendorController::class, 'apply']);
            Route::get('stats', [VendorController::class, 'stats']);
            Route::get('products', [VendorProductController::class, 'index']);
            Route::post('products', [VendorProductController::class, 'store']);
            Route::get('products/{id}', [VendorProductController::class, 'show']);
            Route::put('products/{id}', [VendorProductController::class, 'update']);
            Route::delete('products/{id}', [VendorProductController::class, 'destroy']);
            Route::post('products/bulk-import', [BulkProductImportController::class, 'store']);
            Route::get('orders', [VendorOrderController::class, 'index']);
            Route::get('orders/{id}', [VendorOrderController::class, 'show']);
            Route::patch('orders/{id}/status', [VendorOrderController::class, 'updateStatus']);
            Route::get('analytics/dashboard', [VendorAnalyticsController::class, 'dashboard']);
            Route::get('analytics/top-products', [VendorAnalyticsController::class, 'topProducts']);
            Route::get('analytics/monthly-revenue', [VendorAnalyticsController::class, 'monthlyRevenue']);
        });

        // Dropshipping
        Route::prefix('dropshipping')->middleware('role:vendor,admin')->group(function () {
            Route::get('requests', [DropshipRequestController::class, 'index']);
            Route::post('requests', [DropshipRequestController::class, 'store']);
            Route::get('requests/{id}', [DropshipRequestController::class, 'show']);
            Route::put('requests/{id}', [DropshipRequestController::class, 'update']);
            Route::delete('requests/{id}', [DropshipRequestController::class, 'destroy']);
        });

        // Wallet
        Route::prefix('wallet')->group(function () {
            Route::get('balance', [WalletController::class, 'balance']);
            Route::get('transactions', [WalletController::class, 'transactions']);
            Route::post('topup', [WalletController::class, 'topup'])->middleware('throttle:10,1');
            Route::post('withdraw', [WalletController::class, 'withdraw'])->middleware('throttle:5,1');
            Route::post('transfer', [WalletController::class, 'transfer'])->middleware('throttle:5,1');
        });

        // Payments
        Route::prefix('payments')->group(function () {
            Route::post('initialize', [PaymentController::class, 'initialize']);
            Route::get('verify/{reference}', [PaymentController::class, 'verify']);
        });

        // Escrow (admin + vendor)
        Route::prefix('escrow')->middleware('role:admin,vendor')->group(function () {
            Route::get('/', [EscrowController::class, 'index']);
            Route::get('stats', [EscrowController::class, 'stats']);
            Route::get('{id}', [EscrowController::class, 'show']);
            Route::post('/', [EscrowController::class, 'store'])->middleware('role:admin');
            Route::post('{id}/release', [EscrowController::class, 'release'])->middleware('role:admin');
            Route::post('{id}/partial-release', [EscrowController::class, 'partiallyRelease'])->middleware('role:admin');
        });

        // Disputes
        Route::prefix('disputes')->group(function () {
            Route::get('/', [DisputeController::class, 'index']);
            Route::post('/', [DisputeController::class, 'store'])->middleware('throttle:5,1');
            Route::get('{id}', [DisputeController::class, 'show']);
            Route::post('{id}/resolve', [DisputeController::class, 'resolve'])->middleware('role:admin');
            Route::post('{id}/escalate', [DisputeController::class, 'escalate'])->middleware('role:admin');
        });

        // Notifications
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::patch('{id}/read', [NotificationController::class, 'markRead']);
            Route::patch('read-all', [NotificationController::class, 'markAllRead']);
            Route::delete('{id}', [NotificationController::class, 'destroy']);
        });

        // Notification Preferences
        Route::prefix('notification-preferences')->group(function () {
            Route::get('/', [NotificationPreferencesController::class, 'show']);
            Route::put('/', [NotificationPreferencesController::class, 'update']);
        });

        // AI Assistant
        Route::prefix('ai')->middleware('throttle:30,1')->group(function () {
            Route::post('chat', [AIAssistantController::class, 'chat']);
            Route::post('optimize-product', [AIAssistantController::class, 'optimizeProduct']);
            Route::post('generate-title', [AIAssistantController::class, 'generateTitle']);
            Route::post('generate-description', [AIAssistantController::class, 'generateDescription']);
            Route::post('fraud-score', [AIAssistantController::class, 'fraudScore']);
            Route::post('size-fit', [AISizeFitController::class, 'recommend']);
        });

        // Search
        Route::prefix('search')->group(function () {
            Route::get('history', [SearchController::class, 'history']);
        });

        // Uploads
        Route::prefix('uploads')->middleware('throttle:10,1')->group(function () {
            Route::post('/', [UploadController::class, 'upload']);
            Route::post('multiple', [UploadController::class, 'uploadMultiple']);
            Route::delete('/', [UploadController::class, 'delete']);
        });

        // Coupons
        Route::prefix('coupons')->middleware('role:vendor,admin')->group(function () {
            Route::get('/', [CouponController::class, 'index']);
            Route::post('/', [CouponController::class, 'store']);
            Route::get('{id}', [CouponController::class, 'show']);
            Route::put('{id}', [CouponController::class, 'update']);
            Route::delete('{id}', [CouponController::class, 'destroy']);
        });
        Route::post('coupons/validate', [CouponController::class, 'validate'])->middleware('auth:sanctum');

        // Commissions
        Route::prefix('commissions')->middleware('role:admin,vendor')->group(function () {
            Route::get('/', [CommissionController::class, 'index']);
            Route::get('tiers', [CommissionController::class, 'tiers']);
            Route::get('vendor-rate', [CommissionController::class, 'vendorRate']);
            Route::post('calculate', [CommissionController::class, 'calculate']);
            Route::put('tiers/{id}', [CommissionController::class, 'updateTier'])->middleware('role:admin');
        });

        // Chargebacks
        Route::prefix('chargebacks')->group(function () {
            Route::get('/', [ChargebackController::class, 'index']);
            Route::post('/', [ChargebackController::class, 'store'])->middleware('throttle:5,1');
            Route::post('{id}/resolve', [ChargebackController::class, 'resolve'])->middleware('role:admin');
        });

        // Fraud Alerts (admin only)
        Route::prefix('fraud')->middleware('role:admin')->group(function () {
            Route::get('/', [FraudAlertController::class, 'index']);
            Route::get('stats', [FraudAlertController::class, 'stats']);
            Route::get('{id}', [FraudAlertController::class, 'show']);
            Route::post('{id}/approve', [FraudAlertController::class, 'approve']);
            Route::post('{id}/block', [FraudAlertController::class, 'block']);
            Route::post('{id}/review', [FraudAlertController::class, 'review']);
        });

        // Payouts
        Route::prefix('payouts')->group(function () {
            Route::get('/', [PayoutController::class, 'index']);
            Route::post('/', [PayoutController::class, 'store']);
            Route::get('stats', [PayoutController::class, 'stats']);
            Route::get('{id}', [PayoutController::class, 'show']);
            Route::post('{id}/process', [PayoutController::class, 'process'])->middleware('role:admin');
            Route::post('{id}/cancel', [PayoutController::class, 'cancel'])->middleware('role:admin');
        });

        // Admin routes
        Route::prefix('admin')->middleware('role:admin')->group(function () {
            Route::get('dashboard', [AdminDashboardController::class, 'index']);
            Route::get('revenue', [AdminRevenueController::class, 'index']);

            // Admin users
            Route::prefix('users')->group(function () {
                Route::get('/', [AdminUserController::class, 'index']);
                Route::get('{id}', [AdminUserController::class, 'show']);
                Route::patch('{id}/suspend', [AdminUserController::class, 'suspend']);
                Route::patch('{id}/activate', [AdminUserController::class, 'activate']);
            });

            // Admin vendors
            Route::prefix('vendors')->group(function () {
                Route::get('/', [AdminVendorController::class, 'index']);
                Route::get('{id}', [AdminVendorController::class, 'show']);
                Route::patch('{id}/status', [AdminVendorController::class, 'updateStatus']);
            });

            // Admin disputes
            Route::prefix('disputes')->group(function () {
                Route::get('/', [AdminDisputeController::class, 'index']);
                Route::get('{id}', [AdminDisputeController::class, 'show']);
                Route::post('{id}/resolve', [AdminDisputeController::class, 'resolve']);
                Route::post('{id}/escalate', [AdminDisputeController::class, 'escalate']);
            });

            // Admin products (moderation)
            Route::prefix('products')->group(function () {
                Route::get('/', [AdminProductController::class, 'index']);
                Route::get('{id}', [AdminProductController::class, 'show']);
                Route::post('{id}/approve', [AdminProductController::class, 'approve']);
                Route::post('{id}/reject', [AdminProductController::class, 'reject']);
            });

            // Global Discounts
            Route::prefix('discounts')->group(function () {
                Route::get('/', [GlobalDiscountController::class, 'index']);
                Route::post('/', [GlobalDiscountController::class, 'store']);
                Route::delete('{id}', [GlobalDiscountController::class, 'destroy']);
            });

            // A/B Testing
            Route::prefix('ab-tests')->group(function () {
                Route::get('/', [ABTestingController::class, 'index']);
                Route::post('/', [ABTestingController::class, 'store']);
                Route::get('{id}/results', [ABTestingController::class, 'results']);
            });

            // Vendor Performance
            Route::prefix('vendor-performance')->group(function () {
                Route::get('/', [VendorPerformanceController::class, 'index']);
                Route::get('{id}', [VendorPerformanceController::class, 'score']);
            });
        });

        // Products CRUD (authenticated)
        Route::post('products', [ProductController::class, 'store'])->middleware('role:vendor,admin');
        Route::put('products/{id}', [ProductController::class, 'update'])->middleware('role:vendor,admin');
        Route::delete('products/{id}', [ProductController::class, 'destroy'])->middleware('role:vendor,admin');
    });

    // Return Requests
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('return-requests', ReturnRequestController::class)->only(['index', 'show', 'store']);
        Route::post('return-requests/{id}/approve', [ReturnRequestController::class, 'approve']);
        Route::post('return-requests/{id}/reject', [ReturnRequestController::class, 'reject']);
        Route::post('return-requests/{id}/refund', [ReturnRequestController::class, 'markRefunded']);
    });

    // Recently Viewed
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('recently-viewed', [RecentlyViewedController::class, 'index']);
        Route::post('recently-viewed', [RecentlyViewedController::class, 'store']);
    });

    // Low Stock Alerts
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('low-stock-alerts', [LowStockAlertController::class, 'index']);
        Route::post('low-stock-alerts', [LowStockAlertController::class, 'store'])->middleware('role:vendor');
        Route::post('low-stock-alerts/{id}/resolve', [LowStockAlertController::class, 'resolve'])->middleware('role:vendor');
    });

    // Cashbacks
    Route::middleware('auth:sanctum')->prefix('cashbacks')->group(function () {
        Route::get('/', [CashbackController::class, 'index']);
        Route::get('balance', [CashbackController::class, 'balance']);
    });

    // Order Templates
    Route::middleware('auth:sanctum')->apiResource('order-templates', OrderTemplateController::class)->only(['index', 'store', 'destroy']);

    // Flash Sales
    Route::get('flash-sales', [FlashSaleController::class, 'index']);
    Route::get('flash-sales/{id}', [FlashSaleController::class, 'show']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('flash-sales', [FlashSaleController::class, 'store'])->middleware('role:admin');
        Route::post('flash-sales/{id}/products', [FlashSaleController::class, 'addProduct'])->middleware('role:admin');
    });

    // Suppliers (admin only)
    Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
        Route::apiResource('suppliers', SupplierController::class);
    });

    // Subscription Plans
    Route::get('subscription-plans', [SubscriptionController::class, 'index']);
    Route::get('subscription-plans/{id}', [SubscriptionController::class, 'show']);
    Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
        Route::post('subscription-plans', [SubscriptionController::class, 'store']);
        Route::put('subscription-plans/{id}', [SubscriptionController::class, 'update']);
    });

    // Guest Checkout
    Route::post('guest-checkout', [GuestCheckoutController::class, 'initiate']);
    Route::post('guest-checkout/{id}/complete', [GuestCheckoutController::class, 'complete']);

    // Recommendations (public + authenticated)
    Route::get('recommendations/trending', [RecommendationController::class, 'trending']);
    Route::get('recommendations/related/{productId}', [RecommendationController::class, 'relatedProducts']);
    Route::get('recommendations/also-bought/{productId}', [RecommendationController::class, 'alsoBought']);
    Route::middleware('auth:sanctum')->get('recommendations/for-me', [RecommendationController::class, 'forUser']);

    // Currencies
    Route::get('currencies', [CurrencyController::class, 'index']);
    Route::middleware('auth:sanctum')->post('currencies/set', [CurrencyController::class, 'setCurrency']);

    // SEO
    Route::get('seo/sitemap.xml', [SeoController::class, 'sitemap']);
    Route::get('seo/robots.txt', [SeoController::class, 'robotsTxt']);
    Route::get('seo/meta/{type}/{id}', [SeoController::class, 'meta']);
    Route::middleware(['auth:sanctum', 'role:vendor,admin'])->post('seo/meta', [SeoController::class, 'updateMeta']);

    // KYC
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('kyc/upload', [KycController::class, 'uploadDocument']);
        Route::post('kyc/verify-bank', [KycController::class, 'verifyBankAccount']);
        Route::get('kyc/status', [KycController::class, 'status']);
    });

        // Platform Wallet (admin)
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('platform-wallet')->group(function () {
        Route::get('balance', [PlatformWalletController::class, 'balance']);
        Route::get('transactions', [PlatformWalletController::class, 'transactions']);
        Route::post('transfer-to-vendor', [PlatformWalletController::class, 'transferToVendor']);
    });

        // Referrals
        Route::prefix('referrals')->group(function () {
            Route::get('/', [ReferralController::class, 'index']);
            Route::post('/', [ReferralController::class, 'store']);
            Route::get('stats', [ReferralController::class, 'stats']);
            Route::post('redeem', [ReferralController::class, 'redeem'])->withoutMiddleware('auth:sanctum');
        });

        // Loyalty Points
        Route::prefix('loyalty-points')->group(function () {
            Route::get('/', [LoyaltyPointController::class, 'index']);
            Route::get('balance', [LoyaltyPointController::class, 'balance']);
            Route::post('redeem', [LoyaltyPointController::class, 'redeem']);
        });

        // Refunds (admin)
        Route::prefix('refunds')->middleware('role:admin')->group(function () {
            Route::post('{orderId}/wallet', [RefundController::class, 'toWallet']);
            Route::post('{orderId}/bank', [RefundController::class, 'toBank']);
        });

        // Partial Refunds
        Route::middleware('role:admin')->post('partial-refunds', [PartialRefundController::class, 'store']);
});

// Fallback
Route::fallback(function () {
    return response()->json(['success' => false, 'message' => 'API route not found'], 404);
});
