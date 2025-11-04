import { Box } from "@mui/material";
import { ReactNode, useState } from "react";
import { getToken } from "../../auth/authService";
import TopAppBar from "./TopAppBar";

export default function BasePage({
    children,
}: {
    title: string,
    children: ReactNode,
}) {
    const [isLoggedIn] = useState(!!getToken());

    return <Box>
        <TopAppBar isLoggedIn={isLoggedIn} />
        {children}
    </Box>;
}