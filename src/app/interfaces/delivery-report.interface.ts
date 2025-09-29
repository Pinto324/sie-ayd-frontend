// src/app/interfaces/delivery-report.interface.ts

// Estructuras anidadas (tomadas de la respuesta API)
interface Commerce {
    id: number;
    nit: string;
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
}

interface Status {
    id: number;
    name: string;
    description: string;
}

interface PackageType {
    id: number;
    name: string;
    description: string;
    basePrice: number;
}

interface AssignedTo {
    id: number;
    dni: number;
    userId: number;
    email: string;
    firstname: string;
    lastname: string;
    phoneNumber: string;
}

export interface DeliveryReportItem {
    id: number;
    code: string;
    commerce: Commerce;
    recipient: string;
    address: string;
    phone: string;
    email: string;
    description: string;
    price: number;
    status: Status;
    type: PackageType;
    createdAt: string;
    updatedAt: string;
    requestsCount: number;
    assignedTo: AssignedTo;
    deliveryDate: string;
    guideType: string; // Puedes tipar el enum aquí si lo conoces
}