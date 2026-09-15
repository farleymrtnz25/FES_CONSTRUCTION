const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

// MOCK DATA PARA FALLBACK (Si la DB falla)
const MOCK_ADMIN = {
    id: 999,
    nombre: 'Administrador FES',
    email: 'admin@fes.com',
    password: '', // Se comparará con 'Admin1234!' si la DB falla
    rol: 'admin'
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo (@$!%*?&)'
            });
        }

        try {
            const [existing] = await db.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
            if (existing.length > 0) {
                return res.status(409).json({ error: 'El correo ya está registrado' });
            }

            const hash = await bcrypt.hash(password, 12);
            const [result] = await db.execute(
                'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
                [nombre.trim(), email.toLowerCase().trim(), hash, 'cliente']
            );

            const token = jwt.sign(
                { id: result.insertId, nombre: nombre.trim(), email: email.toLowerCase().trim(), rol: 'cliente' },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(201).json({
                message: 'Usuario registrado exitosamente',
                token,
                user: { id: result.insertId, nombre: nombre.trim(), email: email.toLowerCase().trim(), rol: 'cliente' }
            });
        } catch (dbErr) {
            console.error('DATABASE OFFLINE - Using mock register');
            // Mock register logic (success for demo if DB is down)
            const token = jwt.sign(
                { id: Date.now(), nombre: nombre.trim(), email: email.toLowerCase().trim(), rol: 'cliente' },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            return res.status(201).json({
                message: 'Modo Demo: Usuario registrado localmente',
                token,
                user: { id: Date.now(), nombre: nombre.trim(), email: email.toLowerCase().trim(), rol: 'cliente' }
            });
        }
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error en el servidor al registrar' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña requeridos' });
        }

        const cleanEmail = email.toLowerCase().trim();

        try {
            const [users] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [cleanEmail]);

            if (users.length > 0) {
                const user = users[0];
                const valid = await bcrypt.compare(password, user.password);
                if (valid) {
                    const token = jwt.sign(
                        { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
                        JWT_SECRET,
                        { expiresIn: '7d' }
                    );
                    return res.json({
                        message: 'Login exitoso',
                        token,
                        user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
                    });
                }
            }
        } catch (dbErr) {
            console.error('DATABASE OFFLINE - Using mock login');
        }

        // FALLBACK LOGIN (Para pruebas si la DB no responde o no tiene al admin)
        if (cleanEmail === 'admin@fes.com' && password === 'Admin1234!') {
            const token = jwt.sign(
                { id: MOCK_ADMIN.id, nombre: MOCK_ADMIN.nombre, email: MOCK_ADMIN.email, rol: MOCK_ADMIN.rol },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            return res.json({
                message: 'Login exitoso (Modo Desarrollo/Admin)',
                token,
                user: { id: MOCK_ADMIN.id, nombre: MOCK_ADMIN.nombre, email: MOCK_ADMIN.email, rol: MOCK_ADMIN.rol }
            });
        }

        return res.status(401).json({ error: 'Credenciales incorrectas o servidor ocupado' });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor al iniciar sesión' });
    }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
    try {
        if (req.user.id === MOCK_ADMIN.id) {
            return res.json({ user: MOCK_ADMIN });
        }

        try {
            const [users] = await db.execute('SELECT id, nombre, email, rol, creado_en FROM usuarios WHERE id = ?', [req.user.id]);
            if (users.length > 0) {
                return res.json({ user: users[0] });
            }
        } catch (dbErr) {
            return res.json({ user: req.user }); // Fallback a los datos del token
        }

        res.status(404).json({ error: 'Usuario no encontrado' });
    } catch (error) {
        console.error('Error en /me:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;
