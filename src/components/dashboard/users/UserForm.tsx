"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { IUser } from "@/interfaces/user.interface";
import usersApi from "@/lib/api/user.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Loader2, Mail, MapPin, Phone, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Define the form schema with Zod
const formSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  phone: z.string().optional(),
  gender: z.enum(["male", "female"], {
    error: "Please select a gender",
  }),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  roles: z.array(z.string()).min(0),
});

type FormData = z.infer<typeof formSchema>;

interface UserFormProps {
  initialData?: Partial<IUser>;
  isEditing?: boolean;
}

export function UserForm({ initialData, isEditing = false }: UserFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Convert boolean flags to roles array for initial data
  const getInitialRoles = () => {
    const roles: string[] = [];
    if (initialData?.isSuperAdmin) roles.push("super-admin");
    if (initialData?.isAdmin) roles.push("admin");
    if (initialData?.isPastor) roles.push("pastor");
    if (initialData?.isInstructor) roles.push("instructor");

    return roles;
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      gender: initialData?.gender || undefined,
      address: initialData?.address || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      roles: getInitialRoles(),
    },
  });

  const { control, setValue } = form;
  const selectedRoles = useWatch({
    control,
    name: "roles",
  });

  // Handle role checkbox change
  const handleRoleChange = (role: string, checked: boolean) => {
    const currentRoles = [...selectedRoles];
    let newRoles: string[];

    if (checked) newRoles = [...currentRoles, role];
    else newRoles = currentRoles.filter((r) => r !== role);

    setValue("roles", newRoles);
  };

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: FormData) => usersApi.createUser(data),
    onSuccess: (data) => {
      const { user } = data.data;
      toast.success("User created successfully", {
        description: `${user.firstName} ${user.lastName} has been added to the system.`,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      router.push("/dashboard/users");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create user. Please try again.";
      toast.error("Create User Failed", {
        description: errorMessage,
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (data: FormData) =>
      usersApi.updateUser(initialData?.id || "", data),
    onSuccess: (data) => {
      const { user } = data.data;
      toast.success("User updated successfully", {
        description: `${user.firstName} ${user.lastName} has been updated.`,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", initialData?.id] });
      router.push("/dashboard/users");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update user. Please try again.";
      toast.error("Update User Failed", {
        description: errorMessage,
      });
    },
  });

  const handleFormSubmit = (data: FormData) => {
    console.log("form data>>>", data);
    if (isEditing) {
      updateUserMutation.mutate(data);
    } else {
      createUserMutation.mutate(data);
    }
  };

  const isLoading =
    createUserMutation.isPending || updateUserMutation.isPending;

  const roles = [
    {
      value: "instructor",
      label: "Instructor",
      description: "Can create and manage courses",
      icon: User,
    },
    {
      value: "pastor",
      label: "Pastor",
      description: "Can manage sermons and appointments",
      icon: User,
    },
    {
      value: "admin",
      label: "Admin",
      description: "Full system access except user management",
      icon: Shield,
    },
    {
      value: "super-admin",
      label: "Super Admin",
      description: "Full system access including user management",
      icon: Shield,
    },
  ];

  return (
    <form
      id="user-form"
      onSubmit={form.handleSubmit(handleFormSubmit)}
      className="max-w-4xl mx-auto"
    >
      <FieldGroup className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic details about the user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        id="first-name"
                        placeholder="John"
                        className="pl-10"
                        aria-invalid={fieldState.invalid}
                        disabled={isLoading}
                      />
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                    <Input
                      {...field}
                      id="last-name"
                      placeholder="Doe"
                      aria-invalid={fieldState.invalid}
                      disabled={isLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="pl-10"
                        aria-invalid={fieldState.invalid}
                        disabled={isLoading}
                      />
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="phone">Phone</FieldLabel>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                        aria-invalid={fieldState.invalid}
                        disabled={isLoading}
                      />
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="gender"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="gender">Gender</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
            <CardDescription>
              User&apos;s contact address (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="address">Address</FieldLabel>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      id="address"
                      placeholder="123 Main Street"
                      className="pl-10"
                      aria-invalid={fieldState.invalid}
                      disabled={isLoading}
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="city"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="city">City</FieldLabel>
                    <Input
                      {...field}
                      id="city"
                      placeholder="New York"
                      aria-invalid={fieldState.invalid}
                      disabled={isLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="state"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="state">State</FieldLabel>
                    <Input
                      {...field}
                      id="state"
                      placeholder="NY"
                      aria-invalid={fieldState.invalid}
                      disabled={isLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Role Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Role Assignment</CardTitle>
            <CardDescription>
              Select one or more roles for this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {roles.map((role) => {
                const Icon = role.icon;
                const isChecked = selectedRoles.includes(role.value);

                return (
                  <div
                    key={role.value}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      isChecked
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-muted hover:border-muted-foreground/50"
                    } ${isLoading ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div className="font-medium">{role.label}</div>
                      </div>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleRoleChange(role.value, checked as boolean)
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {role.description}
                    </div>
                  </div>
                );
              })}
            </div>
            {form.formState.errors.roles && (
              <FieldError
                errors={[form.formState.errors.roles]}
                className="mt-2"
              />
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/users")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="user-form"
            disabled={isLoading}
            className="cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Update User"
            ) : (
              "Create User"
            )}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
