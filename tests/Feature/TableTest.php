<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Table;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TableTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $tenant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->actingAs($this->user);
    }

    public function test_can_transfer_table()
    {
        // Arrange: Create From Table (Occupied) and To Table (Free)
        $table1 = Table::factory()->create([
            'tenant_id' => $this->tenant->id,
            'number' => 1,
            'status' => 'occupied',
            'occupied_at' => now(),
        ]);

        $table2 = Table::factory()->create([
            'tenant_id' => $this->tenant->id,
            'number' => 2,
            'status' => 'free',
        ]);

        // Create Order for Table 1
        $order = Order::factory()->create([
            'tenant_id' => $this->tenant->id,
            'table_id' => $table1->id,
            'total' => 100,
        ]);

        $table1->update(['current_order_id' => $order->id]);

        // Act: Transfer Table 1 -> Table 2
        $response = $this->post(route('tables.transfer', ['from' => $table1->id, 'to' => $table2->id]));

        // Assert
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('tables', [
            'id' => $table1->id,
            'status' => 'free',
            'current_order_id' => null,
        ]);

        $this->assertDatabaseHas('tables', [
            'id' => $table2->id,
            'status' => 'occupied',
            'current_order_id' => $order->id,
        ]);

        // Optional: Check if Order was updated (if we implemented that logic)
        // $this->assertDatabaseHas('orders', ['id' => $order->id, 'table_id' => $table2->id]);
    }

    public function test_cannot_transfer_to_occupied_table()
    {
        $table1 = Table::factory()->create([
            'tenant_id' => $this->tenant->id,
            'status' => 'occupied',
            'current_order_id' => Order::factory()->create(['tenant_id' => $this->tenant->id])->id
        ]);

        $table2 = Table::factory()->create([
            'tenant_id' => $this->tenant->id,
            'status' => 'occupied'
        ]);

        $response = $this->post(route('tables.transfer', ['from' => $table1->id, 'to' => $table2->id]));

        $response->assertSessionHasErrors('error');
    }
}
