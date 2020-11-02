import React, { useState } from "react";

import SystemErrorLayout from "./SystemErrorLayout";

const SystemError = (props) => {
    const [open, toggleOpen] = useState(true);

    return (
        <SystemErrorLayout
            open={(props.error || props.timeout) && open}
            onClose={() => toggleOpen(false)}
            error={props.error}
            timeout={props.timeout}
        />
    );
};

export default SystemError;
