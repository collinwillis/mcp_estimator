import {useEffect, useState} from 'react';
import {getAuth} from 'firebase/auth';
import {doc, getDoc, getFirestore} from 'firebase/firestore';
import {UserPermission, UserProfile, UserRole} from '../models/user'; // Import your UserProfile model here

export const useUserProfile = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [hasWritePermissions, setHasWritePermissions] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const db = getFirestore();
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const profile = docSnap.data() as UserProfile;
                    setUserProfile(profile);
                    setIsAdmin(profile.role === UserRole.ADMIN);
                    setHasWritePermissions(profile.permission === UserPermission.READ_WRITE);
                } else {
                    console.error('No user profile found in Firestore');
                    setUserProfile(null);
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        };

        fetchUserProfile();
    }, []);

    return {userProfile, loading, isAdmin, hasWritePermissions};
};
