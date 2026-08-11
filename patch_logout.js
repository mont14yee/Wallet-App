const fs = require('fs');
let code = fs.readFileSync('components/charts/SettingsAndAboutView.tsx', 'utf8');

const handleLogoutStr = `    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error', error);
        }
    };`;

code = code.replace(
    `    const handleProfileSave = (e: React.FormEvent) => {`,
    `${handleLogoutStr}\n\n    const handleProfileSave = (e: React.FormEvent) => {`
);

const logoutButtonStr = `
                                <div className="mt-4 flex gap-3 justify-center sm:justify-start">
                                    <button onClick={handleEditClick} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-purple-600 dark:text-cyan-400 bg-purple-50 dark:bg-cyan-900/20 hover:bg-purple-100 dark:hover:bg-cyan-900/40 transition-colors">
                                       <i className="fas fa-pencil-alt text-xs"></i> {t('sidebarEditProfile')}
                                    </button>
                                    <button onClick={handleLogout} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                                       <i className="fas fa-sign-out-alt text-xs"></i> {t('logout') || 'Log Out'}
                                    </button>
                                </div>
`;

code = code.replace(
    /<button onClick=\{handleEditClick\}[\s\S]*?<\/button>/,
    logoutButtonStr
);

fs.writeFileSync('components/charts/SettingsAndAboutView.tsx', code);
