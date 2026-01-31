<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DebugController extends Controller
{
    public function dumpProduct()
    {
        // Get the first product that has complement groups
        $product = \App\Models\Product::whereHas('complementGroups')->with([
            'complementGroups' => function ($q) {
                // Load WITHOUT filters first to see everything
                $q->with('options');
            }
        ])->first();

        if (!$product) {
            return response()->json(['message' => 'Nenhum produto com complementos encontrado.']);
        }

        return response()->json([
            'product' => $product->name,
            'groups' => $product->complementGroups->map(function ($g) {
                return [
                    'id' => $g->id,
                    'name' => $g->name,
                    'options_count' => $g->options->count(),
                    'options' => $g->options->map(function ($o) {
                        return [
                            'id' => $o->id,
                            'name' => $o->name,
                            'is_available' => $o->is_available,
                            'group_id' => $o->group_id, // Check FK
                            'raw_data' => $o
                        ];
                    })
                ];
            })
        ]);
    }
}
