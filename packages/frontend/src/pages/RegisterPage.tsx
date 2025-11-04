import { Button, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BasicUser, register } from "../auth/authService";

export default function RegisterPage() {
    const [user, setUser] = useState<BasicUser>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        displayName: '',
    })
    const [errors, setErrors] = useState<{
        email: boolean,
        password: boolean,
        firstName: boolean,
        lastName: boolean,
    }>({
        email: false,
        password: false,
        firstName: false,
        lastName: false,
    })
    const navigate = useNavigate();

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, email: event.target.value });
        // Basic email validation
        setErrors({ ...errors, email: !/\S+@\S+\.\S+/.test(event.target.value) && event.target.value !== '' });
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, password: event.target.value });
        // Basic password validation (e.g., minimum length)
        setErrors({ ...errors, password: event.target.value.length < 8 && event.target.value !== '' });
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, [event.target.name]: event.target.value });
        setErrors({ ...errors, [event.target.name]: !event.target.value})
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        // Perform final validation and submission logic here
        if (!errors.email && !errors.password && user.email !== '' && user.password !== '') {
          register(user)
            .then(success => {
                if (success) {
                    navigate('/');
                } else {
                    console.log("failed to register with no error");
                }
            })
            .catch(error => console.error("Failed to register", error));
        } else {
          console.log('Form has errors or missing fields.');
          // Set errors for empty fields if not already set
          if (user.email === '') setErrors({ ...errors, email: true });
          if (user.password === '') setErrors({ ...errors, password: true });
        }
    }

    return <Container component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, }}>
        <TextField
            id="first-name"
            label="First Name"
            name="firstName"
            variant="outlined"
            value={user.firstName}
            onChange={handleNameChange}
            error={errors.firstName}
            helperText={errors.firstName ? 'Please enter a first name' : ''}
            required
            fullWidth
        />
        <TextField
            id="last-name"
            label="Last Name"
            name="lastName"
            variant="outlined"
            value={user.lastName}
            onChange={handleNameChange}
            error={errors.lastName}
            helperText={errors.lastName ? 'Please enter a last name' : ''}
            required
            fullWidth
        />
        <TextField
            id="display-name"
            label="Display Name"
            name="displayName"
            variant="outlined"
            value={user.displayName}
            onChange={handleNameChange}
            fullWidth
        />
        <TextField
            id="email"
            label="Email"
            type="email"
            variant="outlined"
            value={user.email}
            onChange={handleEmailChange}
            error={errors.email}
            helperText={errors.email ? 'Please enter a valid email address' : ''}
            required
            fullWidth
        />
        <TextField
            id="password"
            label="Password"
            type="password"
            variant="outlined"
            value={user.password}
            onChange={handlePasswordChange}
            error={errors.password}
            helperText={errors.password ? 'Password must be at least 8 characters' : ''}
            required
            fullWidth
        />
        <Button type="submit" variant="contained" color="primary">
        Register
        </Button>
        <Typography align="right">
            Already registered? <Link to='/login'>Login here.</Link>
        </Typography>
    </Container>;
}