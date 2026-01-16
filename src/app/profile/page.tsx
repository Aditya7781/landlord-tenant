'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/utils/auth-utils';

export default function ProfileRedirect() {
    const router = useRouter();

    useEffect(() => {
        const session = getSession();
        if (session) {
            router.replace(`/${session.role}/profile`);
        } else {
            router.replace('/login');
        }
    }, [router]);

    return null;
}
