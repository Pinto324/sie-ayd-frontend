// src/app/interfaces/discount-report.interface.ts

interface CommerceDetail {
    id: number;
    nit: string;
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
}

export interface DiscountReportItem {
    id: number;
    // Entregas (Deliveries)
    deliveriesTotalCount: number;       // Cantidad total de guías (Entregas)
    deliveriesTotalAmount: number;      // Monto total sin descuento (Entregas)
    deliveriesApplyPercentage: number;  // Porcentaje de descuento aplicado (Entregas)
    deliveriesSubTotalAmount: number;   // Monto subtotal después del descuento (Entregas)
    // Cancelaciones
    cancelledTotalCount: number;        // Cantidad total de guías (Canceladas)
    cancelledTotalAmount: number;       // Monto total sin descuento (Canceladas)
    cancelledApplyPercentage: number;   // Porcentaje de descuento aplicado (Canceladas)
    cancelledSubTotalAmount: number;    // Monto subtotal después del descuento (Canceladas)
    
    fidelizationLevel: string;          // Nivel de Tarjeta (e.g., 'BRONCE', 'ORO')
    totalAmount: number;                // Monto Total Aplicado (Suma de SubTotales)
    commerce: CommerceDetail;           // Detalle del Comercio
    status: string;                     // Estado del descuento (e.g., 'APLICADO')
    createdDate: string;                // Fecha de creación del registro
}