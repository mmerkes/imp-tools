import { httpServerHandler } from "cloudflare:node";
import { env } from "cloudflare:workers";
import express from "express";
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');

dotenv.config();

function getApiJwtSecrect() {
	return env.IMP_API_JWT_SECRET;
}

function generateAccessToken(email: string) {
  return jwt.sign({ userId: 1, roles: ['user'] }, getApiJwtSecrect(), { expiresIn: '1h' });
}

const app = express();

// TODO: restrict cors
app.use(cors())

// Middleware to parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Express.js running on Cloudflare Workers!" });
});

interface LoginProps {
	email: string,
	password: string,
}

// POST - Create a new member
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, displayName } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

	if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: "First and last name are required",
      });
	}

    // TODO: Do proper validation and clean up
    if (!email.includes("@") || !email.includes(".")) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

	// Generate a salt (random data added to the password before hashing)
    const salt = await bcrypt.genSalt(10); // 10 is the recommended salt rounds
	// Hash the password with the generated salt
    const hashedPassword = await bcrypt.hash(password, salt);

    const joinedDate = new Date().toISOString().split("T")[0];

    const result = await env.DB.prepare(
      "INSERT INTO members (email, password_hash, first_name, last_name, display_name, joined_date) VALUES (?, ?, ?, ?, ?, ?)"
    )
      .bind(email, hashedPassword, firstName, lastName, displayName ?? `${firstName} ${lastName}`, joinedDate)
      .run();

    if (result.success) {
		const token = generateAccessToken(email);
		return res.status(201).json({
        	success: true,
			token,
			id: result.meta.last_row_id,
		});
    } else {
      res
        .status(500)
        .json({ success: false, error: "Failed to create member" });
    }
  } catch (error: any) {
	console.error(error);
    // Handle unique constraint violation
    if (error.message?.includes("UNIQUE constraint failed")) {
      return res.status(409).json({
        success: false,
        error: "Email already exists",
      });
    }
    res.status(500).json({ success: false, error: "Failed to create member" });
  }
});

async function getUser(email: string) {
    const { results } = await env.DB.prepare('SELECT * FROM members WHERE email = ?').bind(email).all();

    if (results.length === 0) {
      throw new Error('Member not found');
    }

    return results[0];
}

app.post('/api/login', async (req, res) => {
	try {
		const { email, password } = req.body as LoginProps;

		const { email: username, password_hash} = await getUser(email);

		if (!username) {
			return res.status(400).send('Invalid credentials');
		}

		// Compare the provided password with the stored hashed password
		const isMatch = await bcrypt.compare(password, password_hash);

		if (!isMatch) {
			return res.status(400).send('Invalid credentials');
		}

		const token = generateAccessToken(email);
		return res.json({ token });
	} catch (error) {
		console.error(error);
	}
});

app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized');
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getApiJwtSecrect());
    (req as any).user = decoded; // Attach user info to request
    next();
  } catch (error) {
    res.status(401).send('Invalid token');
  }
});

// GET all members
app.get('/api/members', async (req, res) => {
  try {
    const { results } = await env.DB.prepare('SELECT * FROM members ORDER BY joined_date DESC').all();

    res.json({ success: true, members: results });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch members' });
  }
});

// GET a single member by ID
app.get('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { results } = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(id).all();

    if (results.length === 0) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    res.json({ success: true, member: results[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch member' });
  }
});

app.put("/api/members/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    // Validate input
    if (!name && !email) {
      return res.status(400).json({
        success: false,
        error: "At least one field (name or email) is required",
      });
    }

    // Basic email validation if provided (simplified for tutorial purposes)
    // For production, consider using a validation library or more comprehensive checks
    if (email && (!email.includes("@") || !email.includes("."))) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (email) {
      updates.push("email = ?");
      values.push(email);
    }

    values.push(id);

    const result = await env.DB.prepare(
      `UPDATE members SET ${updates.join(", ")} WHERE id = ?`
    )
      .bind(...values)
      .run();

    if (result.meta.changes === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Member not found" });
    }

    res.json({ success: true, message: "Member updated successfully" });
  } catch (error: any) {
    if (error.message?.includes("UNIQUE constraint failed")) {
      return res.status(409).json({
        success: false,
        error: "Email already exists",
      });
    }
    res.status(500).json({ success: false, error: "Failed to update member" });
  }
});

// DELETE - Delete a member
app.delete("/api/members/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await env.DB.prepare("DELETE FROM members WHERE id = ?")
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Member not found" });
    }

    res.json({ success: true, message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete member" });
  }
});

app.listen(3000);
export default httpServerHandler({ port: 3000 });