export interface Usuario {
    id?: string; // Opcional, generado por el backend
    name: string;
    birthDate: Date;
    email: string;
    phone: string; // Nuevo campo opcional
    password: string;
    weight: string; // Nuevo campo
    city: string; // Nuevo campo
    gender: string;
    profilePicture?: string; // URL de la imagen de perfil
    confirmPassword?: string; 
    boxingVideo?: string; 
    isHidden?: boolean; // <-- Añadido para filtrar usuarios ocultos
}
