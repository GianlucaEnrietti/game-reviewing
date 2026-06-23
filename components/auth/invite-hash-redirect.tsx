"use client";

import { useEffect } from "react";
import { readInviteHashFromWindow } from "../../utils/auth/invite-hash";

const INVITE_PATH = "/admin/completar-invitacion";

export default function InviteHashRedirect() {
  useEffect(() => {
    const invite = readInviteHashFromWindow();

    if (!invite) {
      return;
    }

    if (window.location.pathname === INVITE_PATH) {
      return;
    }

    window.location.replace(`${INVITE_PATH}${window.location.hash}`);
  }, []);

  return null;
}
