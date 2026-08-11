const fs = require('fs');
let appCode = fs.readFileSync('App.tsx', 'utf8');

const firebaseImports = `
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firebaseError';
`;
appCode = appCode.replace(/import InvestmentsView from '.\/views\/InvestmentsView';/, "import InvestmentsView from './views/InvestmentsView';\n" + firebaseImports);

appCode = appCode.replace(/const loadUserDataFor = [\s\S]*?};\n/m, '');

const stateReplacement = `
    const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
    const [authReady, setAuthReady] = useState(false);

    const [income, setIncome] = useState<Transaction[]>([]);
    const [expenses, setExpenses] = useState<Transaction[]>([]);
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [scheduledTransactions, setScheduledTransactions] = useState<ScheduledTransaction[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
`;
appCode = appCode.replace(/const \[userProfile, setUserProfileState\] = useState[\s\S]*?const \[investments, setInvestments\].*?\n/m, stateReplacement);

fs.writeFileSync('App.tsx', appCode);
