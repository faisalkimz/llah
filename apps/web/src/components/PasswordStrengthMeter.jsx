export default function PasswordStrengthMeter({ password }) {
  // Calculate password strength
  function getStrength(pwd) {
    if (!pwd) return { score: 0, label: '', color: '' };
    
    let score = 0;
    
    // Length check
    if (pwd.length >= 10) score++;
    if (pwd.length >= 12) score++;
    
    // Character variety
    if (/[a-z]/.test(pwd)) score++; // lowercase
    if (/[A-Z]/.test(pwd)) score++; // uppercase
    if (/[0-9]/.test(pwd)) score++; // numbers
    if (/[^a-zA-Z0-9]/.test(pwd)) score++; // special chars
    
    // Determine strength level
    if (score <= 2) {
      return { score: 1, label: 'Weak', color: 'bg-danger' };
    } else if (score <= 4) {
      return { score: 2, label: 'Medium', color: 'bg-warning' };
    } else {
      return { score: 3, label: 'Strong', color: 'bg-success' };
    }
  }
  
  const strength = getStrength(password);
  
  if (!password) return null;
  
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-muted">Password strength</span>
        <span className={`text-xs font-medium ${
          strength.score === 1 ? 'text-danger' : 
          strength.score === 2 ? 'text-warning' : 
          'text-success'
        }`}>
          {strength.label}
        </span>
      </div>
      
      <div className="flex gap-1.5">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all ${
              level <= strength.score ? strength.color : 'bg-line'
            }`}
          />
        ))}
      </div>
      
      {strength.score < 3 && (
        <ul className="mt-2 space-y-1 text-xs text-muted">
          {password.length < 10 && (
            <li className="flex items-center gap-1.5">
              <svg className="h-3 w-3 text-muted" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="3" />
              </svg>
              At least 10 characters
            </li>
          )}
          {!/[A-Z]/.test(password) && (
            <li className="flex items-center gap-1.5">
              <svg className="h-3 w-3 text-muted" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="3" />
              </svg>
              One uppercase letter
            </li>
          )}
          {!/[0-9]/.test(password) && (
            <li className="flex items-center gap-1.5">
              <svg className="h-3 w-3 text-muted" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="3" />
              </svg>
              One number
            </li>
          )}
          {!/[^a-zA-Z0-9]/.test(password) && (
            <li className="flex items-center gap-1.5">
              <svg className="h-3 w-3 text-muted" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="3" />
              </svg>
              One special character
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
