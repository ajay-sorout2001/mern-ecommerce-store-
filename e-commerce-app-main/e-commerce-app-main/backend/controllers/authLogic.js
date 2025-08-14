const User = require("../models/userSchema.js");
const Seller = require("../models/sellerSchema.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
    const { role } = req.query;
    const userData = req.body;

    try {
        let Model;
        // Allow admin signup only for the configured admin email
        if (userData.email === "admin@email.com") {
            Model = User;
            // Force role to admin
            userData.role = "admin";
        } else if (role === "seller") {
            Model = Seller;
        } else if (role === "user") {
            Model = User;
        } else {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }

        if (!userData.password) {
            return res.status(400).json({
                success: false,
                message: "Password is required"
            });
        }

        const existingUser = await User.findOne({ email: userData.email });
        const existingSeller = await Seller.findOne({ email: userData.email });

        if (existingUser || existingSeller) {
            return res.status(400).json({
                success: false,
                message: "Email already exists. Please use a different email or login instead."
            });
        }

        const saltValue = 10;
        userData.password = await bcrypt.hash(userData.password, saltValue);

        const newUser = new Model(userData);
        await newUser.save();

        // Set role for JWT: admin if admin email, else from param
        const jwtRole = userData.email === "admin@email.com" ? "admin" : role;
        const token = jwt.sign(
            { userId: newUser._id, role: jwtRole },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Set secure cookie for authentication
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        const userResponse = newUser.toObject();
        delete userResponse.password;

        return res.status(200).json({
            success: true,
            message: `${role} account created successfully`,
            data: {
                user: userResponse,
                role: role,
            },
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: `Failed to create ${role}`,
            error: error.message,
        });
    }
};

const login = async (req, res) => {
    const { role } = req.query;
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    try {
        let Model;
        let user;
        let jwtRole = role;

        // Always check for admin email in User collection, regardless of role param
        if (email === "admin@email.com") {
            user = await User.findOne({ email: email });
            jwtRole = "admin";
        } else if (role === "seller") {
            Model = Seller;
            user = await Model.findOne({ email: email });
            jwtRole = "seller";
        } else if (role === "user") {
            Model = User;
            user = await Model.findOne({ email: email });
            jwtRole = "user";
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid role",
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `No account found with this email for role: ${jwtRole}`,
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            { userId: user._id, role: jwtRole },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Set secure cookie for authentication
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({
            success: true,
            message: `${jwtRole} logged in successfully`,
            data: {
                user: userResponse,
                role: jwtRole,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message,
        });
    }
};

// Requires current password verification
const changePassword = async (req, res) => {
    const { role } = req.query;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Current password and new password are required'
        });
    }

    try {
        let Model;
        const userId = req.user.userId;

        if (role === "seller") {
            Model = Seller;
        } else if (role === "user") {
            Model = User;
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        const user = await Model.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `${role} not found`
            });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        await Model.findByIdAndUpdate(userId, { password: hashedNewPassword });

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: error.message
        });
    }
};

// Cross-collection email verification required
const changeEmail = async (req, res) => {
    const { role } = req.query;
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
        return res.status(400).json({
            success: false,
            message: 'New email and password are required'
        });
    }

    try {
        let Model;
        const userId = req.user.userId;

        if (role === "seller") {
            Model = Seller;
        } else if (role === "user") {
            Model = User;
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        const user = await Model.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `${role} not found`
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Password is incorrect'
            });
        }

        // Prevent cross-collection email duplication
        const existingUser = await User.findOne({ email: newEmail });
        const existingSeller = await Seller.findOne({ email: newEmail });

        if (existingUser || existingSeller) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const updatedUser = await Model.findByIdAndUpdate(
            userId,
            { email: newEmail },
            { new: true }
        );

        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        return res.status(200).json({
            success: true,
            message: 'Email changed successfully',
            data: userResponse
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to change email',
            error: error.message
        });
    }
};

const logout = async (req, res) => {
    try {
        // Clear authentication cookie
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: error.message
        });
    }
};

// Get current authenticated user
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;

        let user;
        if (role === 'seller') {
            user = await Seller.findById(userId).select('-password');
        } else {
            user = await User.findById(userId).select('-password');
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: { ...user.toObject(), role }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get user information',
            error: error.message
        });
    }
};

module.exports = { signup, login, changePassword, changeEmail, logout, getCurrentUser };
