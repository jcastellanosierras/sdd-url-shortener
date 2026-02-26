import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validations";

describe("loginSchema", () => {
  it("accepts valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
      expect(result.data.password).toBe("secret123");
    }
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "secret123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailIssue = result.error.issues.find((i) =>
        i.path.includes("email")
      );
      expect(emailIssue?.message).toBe("El correo no puede estar vacío");
    }
  });

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const emailIssue = result.error.issues.find((i) =>
        i.path.includes("email")
      );
      expect(emailIssue?.message).toBe("Introduce un correo válido");
    }
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordIssue = result.error.issues.find((i) =>
        i.path.includes("password")
      );
      expect(passwordIssue?.message).toBe("La contraseña no puede estar vacía");
    }
  });
});

describe("registerSchema", () => {
  it("accepts valid name, email, password and matching passwordConfirm", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
      passwordConfirm: "password123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Jane Doe");
      expect(result.data.email).toBe("jane@example.com");
      expect(result.data.password).toBe("password123");
      expect(result.data.passwordConfirm).toBe("password123");
    }
  });

  it("rejects when password and passwordConfirm do not match with correct message", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "password123",
      passwordConfirm: "otherpassword",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmIssue = result.error.issues.find(
        (i) =>
          i.path.join(".") === "passwordConfirm" ||
          i.message === "Las contraseñas no coinciden"
      );
      expect(confirmIssue?.message).toBe("Las contraseñas no coinciden");
    }
  });

  it("rejects password too short", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "short",
      passwordConfirm: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordIssue = result.error.issues.find((i) =>
        i.path.includes("password")
      );
      expect(passwordIssue?.message).toBe(
        "La contraseña debe tener al menos 8 caracteres"
      );
    }
  });

  it("rejects empty name", () => {
    const result = registerSchema.safeParse({
      name: "",
      email: "jane@example.com",
      password: "password123",
      passwordConfirm: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameIssue = result.error.issues.find((i) =>
        i.path.includes("name")
      );
      expect(nameIssue?.message).toBe("El nombre no puede estar vacío");
    }
  });
});
