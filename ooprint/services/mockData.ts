
import { Order } from '../types';

export const initialOrders: Order[] = [
  {
    id: "ORD-9281",
    customer: "Ricardo Oliveira",
    phone: "(11) 98765-4321",
    address: "Rua das Flores, 123 - Ap 42",
    items: [
      { 
        id: "i1", 
        name: "Hambúrguer Gourmet Master", 
        quantity: 2, 
        price: 34.90, 
        observations: "Carne mal passada",
        complements: ["+ Adicional Bacon", "+ Queijo Cheddar", "Sem Picles"]
      },
      { id: "i2", name: "Batata Frita G", quantity: 1, price: 18.00, complements: ["+ Molho Especial"] },
      { id: "i3", name: "Coca-Cola 350ml", quantity: 2, price: 6.50 }
    ],
    total: 104.80,
    paymentMethod: "Cartão de Crédito",
    timestamp: "Há 2 minutos",
    status: 'pending',
    deliveryFee: 6.00,
    serviceFee: 4.00 // Exemplo de acréscimo de maquineta
  },
  {
    id: "ORD-9280",
    customer: "Amanda Silva",
    phone: "(11) 91234-5678",
    address: "Av. Paulista, 1000",
    items: [
      { 
        id: "i4", 
        name: "Pizza Calabresa Família", 
        quantity: 1, 
        price: 55.00, 
        complements: ["Borda recheada Catupiry", "Massa Fina"] 
      },
      { id: "i5", name: "Guaraná 2L", quantity: 1, price: 12.00 }
    ],
    total: 72.00,
    paymentMethod: "PIX",
    timestamp: "Há 12 minutos",
    status: 'printed',
    deliveryFee: 5.00,
    serviceFee: 0
  }
];
