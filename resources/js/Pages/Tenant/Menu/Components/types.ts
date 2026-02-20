export interface ComplementOption {
    id: string;
    name: string;
    price: number;
    is_available: boolean;
    max_quantity?: number;
    stock?: number | null;
}

export interface ComplementGroup {
    id: string;
    name: string;
    min_selections: number;
    max_selections: number;
    is_required: boolean;
    options: ComplementOption[];
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: string;
    image_url?: string;
    complement_groups?: ComplementGroup[];
    track_stock: boolean;
    stock_quantity: number | null;
    loyalty_redeemable?: boolean;
    loyalty_points_cost?: number;
    loyalty_earns_points?: boolean;
    loyalty_points_multiplier?: number;
    promotional_price?: string;
    is_featured?: boolean;
    is_available?: boolean;
    is_promotional?: boolean;
    is_new?: boolean;
    is_exclusive?: boolean;
}

export interface Category {
    id: string;
    name: string;
    products: Product[];
    category_type?: string;
    description?: string;
    is_active?: boolean;
    sort_order?: number;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    loyalty_points: number;
    loyalty_tier?: string;
    referral_code?: string;
}

export interface Address {
    id: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    is_default: boolean;
}

export interface Order {
    id: string;
    order_number: string;
    status: string;
    total: string;
    created_at: string;
    loyalty_points_earned: number;
}
