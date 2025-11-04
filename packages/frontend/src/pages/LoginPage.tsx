import { Button, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../auth/authService";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        // Perform final validation and submission logic here
        if (!emailError && !passwordError && !!email && !!password) {
          login(email, password)
            .then(success => {
                if (success) {
                    navigate('/');
                } else {
                    console.log("failed to register with no error");
                }
            })
            .catch(error => console.error("Failed to register", error));
        } else {
            // Set errors for empty fields if not already set
            if (email === '') setEmailError(true);
            if (password === '') setPasswordError(true);
          console.log('Form has errors or missing fields.');
        }
    }

    return <Container component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, }}>
        <TextField
            id="email"
            label="Email"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            helperText={emailError ? 'Please enter a valid email address' : ''}
            required
            fullWidth
        />
        <TextField
            id="password"
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            helperText={passwordError ? 'Password must be at least 8 characters' : ''}
            required
            fullWidth
        />
        <Button type="submit" variant="contained" color="primary">
        Login
        </Button>
        <Typography align="right">
            Not registered yet? <Link to='/register'>Register here.</Link>
        </Typography>
    </Container>;
}