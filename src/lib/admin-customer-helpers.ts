import { db } from './db';
import { generateUserId } from './user-id';
import { hashPassword } from './password';

/**
 * Example: Create an Admin with auto-generated user_id and hashed password
 */
export async function createAdmin(data: {
    name: string;
    email: string;
    password: string;
    referCode: string;
    role?: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
}) {
    // Hash the password
    const hashedPassword = await hashPassword(data.password);

    // First create the admin to get the auto-increment ID
    const admin = await db.admin.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            referCode: data.referCode,
            role: data.role || 'ADMIN',
            user_id: 'TEMP', // Temporary value
        },
    });

    // Update with the properly formatted user_id
    return await db.admin.update({
        where: { id: admin.id },
        data: {
            user_id: generateUserId(admin.id),
        },
    });
}

/**
 * Example: Create a Customer with auto-generated user_id
 */
export async function createCustomer(data: {
    name: string;
    email: string;
    password: string;
    referCode: string;
}) {
    // First create the customer to get the auto-increment ID
    const customer = await db.customer.create({
        data: {
            ...data,
            user_id: 'TEMP', // Temporary value
        },
    });

    // Update with the properly formatted user_id
    return await db.customer.update({
        where: { id: customer.id },
        data: {
            user_id: generateUserId(customer.id),
        },
    });
}
