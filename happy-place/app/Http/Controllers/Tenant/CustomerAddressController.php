<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\CustomerAddress;
use Illuminate\Http\Request;

class CustomerAddressController extends Controller
{
    public function index()
    {
        $customerId = session('customer_id');
        if (!$customerId) {
            return response()->json(['message' => 'Não autenticado'], 401);
        }

        $addresses = CustomerAddress::where('customer_id', $customerId)
            ->orderBy('is_default', 'desc')
            ->get();

        return response()->json($addresses);
    }

    public function store(Request $request)
    {
        $customerId = session('customer_id');
        if (!$customerId) {
            return response()->json(['message' => 'Não autenticado'], 401);
        }

        // Check if customer already has 2 addresses
        $addressCount = CustomerAddress::where('customer_id', $customerId)->count();
        if ($addressCount >= 2) {
            return response()->json([
                'message' => 'Você já possui o máximo de 2 endereços cadastrados.'
            ], 422);
        }

        $validated = $request->validate([
            'street' => 'required|string',
            'number' => 'required|string',
            'complement' => 'nullable|string',
            'neighborhood' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'zip_code' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        // If this is the first address, make it default
        $isFirst = $addressCount === 0;

        $address = CustomerAddress::create([
            'customer_id' => $customerId,
            'tenant_id' => \App\Models\Customer::find($customerId)->tenant_id,
            'street' => $validated['street'],
            'number' => $validated['number'],
            'complement' => $validated['complement'] ?? null,
            'neighborhood' => $validated['neighborhood'],
            'city' => $validated['city'],
            'state' => $validated['state'],
            'zip_code' => $validated['zip_code'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'is_default' => $isFirst,
        ]);

        return response()->json([
            'message' => 'Endereço cadastrado com sucesso!',
            'address' => $address
        ]);
    }

    public function update(Request $request, $id)
    {
        $customerId = session('customer_id');
        if (!$customerId) {
            return response()->json(['message' => 'Não autenticado'], 401);
        }

        $address = CustomerAddress::where('customer_id', $customerId)
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'street' => 'required|string',
            'number' => 'required|string',
            'complement' => 'nullable|string',
            'neighborhood' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'zip_code' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $address->update($validated);

        return response()->json([
            'message' => 'Endereço atualizado com sucesso!',
            'address' => $address
        ]);
    }

    public function destroy($id)
    {
        $customerId = session('customer_id');
        if (!$customerId) {
            return response()->json(['message' => 'Não autenticado'], 401);
        }

        $address = CustomerAddress::where('customer_id', $customerId)
            ->where('id', $id)
            ->firstOrFail();

        // If deleting default address, make another one default
        if ($address->is_default) {
            $otherAddress = CustomerAddress::where('customer_id', $customerId)
                ->where('id', '!=', $id)
                ->first();

            if ($otherAddress) {
                $otherAddress->update(['is_default' => true]);
            }
        }

        $address->delete();

        return response()->json([
            'message' => 'Endereço removido com sucesso!'
        ]);
    }

    public function setDefault($id)
    {
        $customerId = session('customer_id');
        if (!$customerId) {
            return response()->json(['message' => 'Não autenticado'], 401);
        }

        // Remove default from all addresses
        CustomerAddress::where('customer_id', $customerId)
            ->update(['is_default' => false]);

        // Set new default
        $address = CustomerAddress::where('customer_id', $customerId)
            ->where('id', $id)
            ->firstOrFail();

        $address->update(['is_default' => true]);

        return response()->json([
            'message' => 'Endereço padrão atualizado!',
            'address' => $address
        ]);
    }
}
