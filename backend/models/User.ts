export interface User {
  id: string;
  email: string;
  password: string; // This will store the hashed password
  name: string;
  createdAt: Date;
  savedMedicines: string[];
}

// In-memory storage for development
export class UserStore {
  private users: Map<string, User> = new Map();
  private emailToId: Map<string, string> = new Map();

  async createUser(email: string, hashedPassword: string, name: string): Promise<User> {
    // Check if user already exists
    if (this.emailToId.has(email)) {
      throw new Error('User already exists');
    }

    const id = this.generateId();
    const user: User = {
      id,
      email,
      password: hashedPassword, // Store the hashed password
      name,
      createdAt: new Date(),
      savedMedicines: []
    };

    this.users.set(id, user);
    this.emailToId.set(email, id);
    
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userId = this.emailToId.get(email);
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async saveMedicine(userId: string, medicineName: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    if (!user.savedMedicines.includes(medicineName)) {
      user.savedMedicines.push(medicineName);
      this.users.set(userId, user);
    }
  }

  async removeSavedMedicine(userId: string, medicineName: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    user.savedMedicines = user.savedMedicines.filter(med => med !== medicineName);
    this.users.set(userId, user);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const userStore = new UserStore(); 