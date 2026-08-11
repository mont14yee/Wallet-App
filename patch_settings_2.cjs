const fs = require('fs');
let code = fs.readFileSync('components/charts/SettingsAndAboutView.tsx', 'utf8');

code = "import { auth } from '../../firebaseConfig';\nimport { signOut } from 'firebase/auth';\n" + code;

const profileMatch = code.match(/<SettingsSection title=\{t\('profile'\)\} icon="fas fa-user-circle">([\s\S]*?)<\/SettingsSection>/);

if (profileMatch) {
    const newProfileSection = `
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error', error);
        }
    };
    return (
        <div className="pb-24 animate-fade-in px-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">{t('settings')}</h1>
            
            <SettingsSection title={t('profile')} icon="fas fa-user-circle">
                <div className="p-4 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 overflow-hidden">
                        {userProfile?.avatar ? (
                            <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <i className="fas fa-user text-3xl"></i>
                            </div>
                        )}
                    </div>
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{userProfile?.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400">{userProfile?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full py-2.5 px-4 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>{t('logout') || 'Log Out'}</span>
                    </button>
                </div>
            </SettingsSection>
`;

    code = code.replace(/    return \(\s*<div className="pb-24 animate-fade-in px-4">\s*<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">\{t\('settings'\)\}<\/h1>\s*<SettingsSection title=\{t\('profile'\)\} icon="fas fa-user-circle">[\s\S]*?<\/SettingsSection>/, newProfileSection);
    
    fs.writeFileSync('components/charts/SettingsAndAboutView.tsx', code);
    console.log("Success");
} else {
    console.log("Profile section not found");
}
