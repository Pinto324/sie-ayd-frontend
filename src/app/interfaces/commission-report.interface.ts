// src/app/interfaces/commission-report.interface.ts

interface CommissionUser {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
}

export interface CommissionReportItem {
    paymentId: number;
    referenceCode: string;
    user: CommissionUser;
    amount: number;
    paymentMethod: string;
    status: string;
    paymentDate: string; // ISO 8601 Date time string
    comment: string;
}