const fs = require('fs');

let appContent = fs.readFileSync('App.tsx', 'utf8');

// 1. replace SavingsView import
appContent = appContent.replace(/import SavingsView from '\.\/views\/TargetsView';/, "import SavingsView from './views/SavingsView';");

// 2. replace MoreView import
appContent = appContent.replace(/import MoreView from '\.\/views\/CalculatorView';/, "import MoreView from './views/MoreView';");

// 3. replace Calculator import -> CalculatorView
appContent = appContent.replace(/import Calculator from '\.\/views\/ShoppingView';/, "import CalculatorView from './views/CalculatorView';");
// Also update the tag
appContent = appContent.replace(/<Calculator \/>/, "<CalculatorView />");

// 4. replace NutritionView import
appContent = appContent.replace(/import NutritionView from '\.\/components\/SettingsModal';/, "import NutritionView from './components/NutritionView';");

// 5. replace SettingsAndAboutView import
appContent = appContent.replace(/import SettingsAndAboutView from '\.\/components\/charts\/ExpenseChart';/, "import SettingsAndAboutView from './components/charts/SettingsAndAboutView';");

fs.writeFileSync('App.tsx', appContent);

// Wait, the new views/CalculatorView.tsx (formerly ShoppingView.tsx) currently exports `Calculator` not `CalculatorView`. 
// "Rename these files to match their default-exported component" -> the prompt says they were ALREADY exporting these, so let's verify if `Calculator` or `CalculatorView` was exported. Wait, I checked earlier, `views/ShoppingView.tsx` exported `Calculator`. 
// The prompt says "Update the five corresponding import paths in App.tsx to plain, non-aliased imports that match the new filenames." 
// So `import CalculatorView from './views/CalculatorView';` might require the default export to be renamed, but wait, since it's a default export, it doesn't matter what the internal name is unless there is an ESLint rule or something.
