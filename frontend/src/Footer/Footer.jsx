import styles from './Footer.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub} from "@fortawesome/free-brands-svg-icons";
import { faMicrochip, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import C2Image from '../images/frogv2.png'

export default function Footer() {
  const socialLinks = [
    { name: 'AI@TCU', url: 'https://ai.tcu.edu', icon: faMicrochip },
    { name: 'GitHub', url: 'https://github.com/TCU-ClassifAI', icon: faGithub },
    { name: 'Documentation', url: 'https://tcu-classifai.github.io/classifAI/', icon: faFolderOpen },
  ]

  return (
    <footer className={styles.footer}>
      <a className="navbar-brand" href="/">
        <img
          src={C2Image}
          className="tcu-image"
          alt="classifAI logo" />
      </a>
      <div className={styles.footerContent}>
        <div className={styles.footerLinks}>
          <a href="https://ai.tcu.edu">AI@TCU</a>
          <a href="https://github.com/TCU-ClassifAI">GitHub</a>
          <a href="https://tcu-classifai.github.io/classifAI/">Documentation</a>
        </div>
        <div className={styles.footerIcons}>
          {socialLinks.map((link, index) => (
            <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={link.icon} />
            </a>
          ))}
        </div>
      </div>
      <div className={styles.footerCopyright}>
        <p>&copy; {new Date().getFullYear()} ClassifAI @ TCU. All rights reserved.</p>
      </div>
    </footer>
  );
};