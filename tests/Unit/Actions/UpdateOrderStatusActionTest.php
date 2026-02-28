<?php

namespace Tests\Unit\Actions;

use App\Models\Order;
use App\Models\User;
use App\Modules\Delivery\Actions\UpdateOrderStatusAction;
use App\Services\AuditLogService;
use Mockery;
use Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration;
use Tests\TestCase;

/**
 * @agent @qa
 * FASE 3 – Testes unitários para UpdateOrderStatusAction
 */
class UpdateOrderStatusActionTest extends TestCase
{
    use MockeryPHPUnitIntegration;

    private UpdateOrderStatusAction $action;

    protected function setUp(): void
    {
        parent::setUp();
        $this->action = new UpdateOrderStatusAction();
    }

    /** @test */
    public function test_updates_status_successfully(): void
    {
        $order = Mockery::mock(Order::class)->makePartial();
        $order->status = 'new';
        $order->shouldReceive('update')
            ->once()
            ->with(['status' => 'preparing'])
            ->andReturn(true);

        $this->action->execute($order, 'preparing');

        // Não lançou exceção = passou
        $this->assertTrue(true);
    }

    /** @test */
    public function test_does_not_update_when_status_is_same(): void
    {
        $order = Mockery::mock(Order::class)->makePartial();
        $order->status = 'preparing';
        $order->shouldNotReceive('update');

        $this->action->execute($order, 'preparing');

        $this->assertTrue(true);
    }

    /** @test */
    public function test_calls_audit_log_when_actor_provided(): void
    {
        $order = Mockery::mock(Order::class)->makePartial();
        $order->status = 'new';
        $order->shouldReceive('update')->once()->andReturn(true);

        $actor = Mockery::mock(User::class);

        $auditMock = Mockery::mock('alias:' . AuditLogService::class);
        $auditMock->shouldReceive('record')
            ->once()
            ->with($actor, 'order.status_changed', $order, Mockery::type('array'));

        $this->action->execute($order, 'preparing', $actor);
    }

    /** @test */
    public function test_skips_audit_log_when_no_actor(): void
    {
        $order = Mockery::mock(Order::class)->makePartial();
        $order->status = 'new';
        $order->shouldReceive('update')->once()->andReturn(true);

        $auditMock = Mockery::mock('alias:' . AuditLogService::class);
        $auditMock->shouldNotReceive('record');

        $this->action->execute($order, 'preparing', null);

        $this->assertTrue(true);
    }
}
