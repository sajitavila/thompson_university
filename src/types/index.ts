export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  cedula: string;
  birthDate: string;
  email: string;
  phone: string;
  address: string;
  registrationDate: string;
}

export interface Exam {
  id: string;
  name: string;
  type: 'cedula' | 'titulo' | 'certificado';
  date: string;
  time: string;
  location: string;
  maxCapacity: number;
  status: 'programado' | 'en_curso' | 'finalizado' | 'cancelado';
}

export interface Enrollment {
  id: string;
  studentId: string;
  examId: string;
  enrollmentDate: string;
  status: 'inscrito' | 'completado' | 'cancelado';
}

export interface Grade {
  id: string;
  enrollmentId: string;
  studentId: string;
  examId: string;
  score: number;
  passed: boolean;
  gradedDate: string;
}

export interface Payment {
  id: string;
  studentId: string;
  firstName?: string;
  lastName?: string;
  concept: 'inscripcion' | 'examen' | 'certificado' | 'reposicion';
  amount: number;
  paymentDate: string;
  method: 'efectivo' | 'tarjeta' | 'transferencia';
  status: 'pendiente' | 'pagado';
}

export type ExamType = Exam['type'];
export type ExamStatus = Exam['status'];
export type EnrollmentStatus = Enrollment['status'];
export type PaymentConcept = Payment['concept'];
export type PaymentMethod = Payment['method'];
export type PaymentStatus = Payment['status'];
