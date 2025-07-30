import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Package, Plus } from 'lucide-react'
import { Button } from './ui/Button'

function Inventory({ products = [], setProducts, currentUser }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gestione Inventario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">Inventario prodotti</p>
            <p className="text-sm text-gray-500">{products.length} prodotti registrati</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Inventory