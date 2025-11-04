import { Box } from "@mui/material";
import React, { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../auth/authService";

interface AuthenticatedPageProps {
    title: string,
    children: ReactNode,
}

const AuthenticatedPage: React.FC<AuthenticatedPageProps> = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = getToken();
        if (!token) {
            // TODO: Validate the creds are still valid?
            navigate('/login');
        }
    }, []);
    return <Box>
        {children}
    </Box>;
}

export default AuthenticatedPage;