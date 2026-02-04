<?php

namespace Tests\Unit;

use App\Models\WhatsAppInstance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WhatsAppInstanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_mark_as_connected_updates_status()
    {
        $instance = WhatsAppInstance::create([
            'instance_name' => 'test-instance',
            'instance_type' => 'shared',
            'status' => 'connecting',
        ]);

        $instance->markAsConnected('5511999999999');

        $this->assertEquals('connected', $instance->status);
        $this->assertEquals('5511999999999', $instance->phone_number);
        $this->assertNotNull($instance->last_connected_at);
        $this->assertNull($instance->qr_code);
    }

    public function test_mark_as_disconnected_updates_status()
    {
        $instance = WhatsAppInstance::create([
            'instance_name' => 'test-instance',
            'instance_type' => 'shared',
            'status' => 'connected',
            'phone_number' => '5511999999999',
        ]);

        $instance->markAsDisconnected();

        $this->assertEquals('disconnected', $instance->status);
        $this->assertNull($instance->qr_code);
    }

    public function test_mark_as_connected_clears_qr_code()
    {
        $instance = WhatsAppInstance::create([
            'instance_name' => 'test-instance',
            'instance_type' => 'shared',
            'status' => 'connecting',
            'qr_code' => 'base64-encoded-qr',
        ]);

        $instance->markAsConnected();

        $this->assertNull($instance->qr_code);
    }

    public function test_mark_as_connected_preserves_phone_number_if_empty()
    {
        $instance = WhatsAppInstance::create([
            'instance_name' => 'test-instance',
            'instance_type' => 'shared',
            'status' => 'connecting',
            'phone_number' => '5511999999999',
        ]);

        $instance->markAsConnected('');

        $this->assertEquals('5511999999999', $instance->phone_number);
    }
}
