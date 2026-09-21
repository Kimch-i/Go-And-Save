import { Link } from 'react-router';
import styles from './Button.module.css';

export default function Button({ variant = 'primary', to, type = 'button', className = '', children, ...rest }) {
  const classes = `${styles.button} ${styles[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
