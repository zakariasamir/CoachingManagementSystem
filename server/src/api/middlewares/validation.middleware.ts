import { celebrate, Joi } from "celebrate";

// User validation schemas
const userValidation = {
  createUser: celebrate({
    body: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      role: Joi.string()
        .valid("admin", "manager", "coach", "entrepreneur")
        .required(),
    }),
  }),
  updateUser: celebrate({
    body: Joi.object({
      firstName: Joi.string(),
      lastName: Joi.string(),
      email: Joi.string().email(),
      role: Joi.string().valid("admin", "manager", "coach", "entrepreneur"),
    }),
  }),
  updateUserStatus: celebrate({
    body: Joi.object({
      status: Joi.string().valid("active", "inactive").required(),
    }),
  }),
};

// Session validation schemas
const sessionValidation = {
  createSession: celebrate({
    body: Joi.object({
      title: Joi.string().required(),
      startTime: Joi.date().iso().required(),
      endTime: Joi.date().iso().min(Joi.ref("startTime")).required(),
      organizationId: Joi.string().required(),
      coachId: Joi.string().required(),
      entrepreneurIds: Joi.array().items(Joi.string()).min(1).required(),
      price: Joi.number().required(),
      notes: Joi.string().optional().allow("").default(""),
    }),
  }),
};

// Organization validation schemas
const organizationValidation = {
  createOrganization: celebrate({
    body: Joi.object({
      name: Joi.string().required(),
    }),
  }),
  addUserToOrganization: celebrate({
    body: Joi.object({
      userId: Joi.string().required(),
      organizationId: Joi.string().required(),
      role: Joi.string().valid("manager", "coach", "entrepreneur").required(),
    }),
  }),
};

// Goal validation schemas
const goalValidation = {
  createGoal: celebrate({
    body: Joi.object({
      entrepreneurId: Joi.string().required(),
      coachId: Joi.string().required(),
      organizationId: Joi.string().required(),
      title: Joi.string().required(),
      description: Joi.string(),
    }),
  }),
};

// Auth validation schemas
const authValidation = {
  register: celebrate({
    body: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      role: Joi.string()
        .valid("admin", "manager", "coach", "entrepreneur")
        .required(),
      organizationId: Joi.string().required(),
    }),
  }),
  login: celebrate({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  switchOrganization: celebrate({
    body: Joi.object({
      organizationId: Joi.string().required(),
    }),
  }),
};

export {
  userValidation,
  sessionValidation,
  organizationValidation,
  goalValidation,
  authValidation,
};
