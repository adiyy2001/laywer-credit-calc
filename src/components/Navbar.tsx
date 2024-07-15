import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLinkClick = (route: string) => {
    navigate(route, { state: { from: location.pathname } });
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    route: string,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleLinkClick(route);
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 p-4 fixed w-full z-10 shadow-md"
    >
      <div className="container mx-auto flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-white text-lg font-bold"
        >
          Kalkulator kredytowy
        </motion.div>
        <div className="space-x-4 flex">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={() => handleLinkClick('/')}
            onKeyDown={(e) => handleKeyDown(e, '/')}
            tabIndex={0}
            role="button"
            className="text-gray-300 hover:text-white transition duration-300 ease-in-out cursor-pointer"
          >
            Strona główna
          </motion.div>
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              tabIndex={0}
              role="button"
              className="text-gray-300 hover:text-white transition duration-300 ease-in-out cursor-pointer"
            >
              Płatności
            </motion.div>
            {dropdownOpen && (
              <div className="absolute left-0 top-full w-48 bg-white rounded-md shadow-lg z-20">
                <div
                  onClick={() => handleLinkClick('/payments/main-claim')}
                  onKeyDown={(e) => handleKeyDown(e, '/payments/main-claim')}
                  tabIndex={0}
                  role="button"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer"
                >
                  Główne roszczenie
                </div>
                <div
                  onClick={() => handleLinkClick('/payments/first-claim')}
                  onKeyDown={(e) => handleKeyDown(e, '/payments/first-claim')}
                  tabIndex={0}
                  role="button"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer"
                >
                  Pierwsze roszczenie
                </div>
                <div
                  onClick={() => handleLinkClick('/payments/second-claim')}
                  onKeyDown={(e) => handleKeyDown(e, '/payments/second-claim')}
                  tabIndex={0}
                  role="button"
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer"
                >
                  Drugie roszczenie
                </div>
              </div>
            )}
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={() => handleLinkClick('/summary')}
            onKeyDown={(e) => handleKeyDown(e, '/summary')}
            tabIndex={0}
            role="button"
            className="text-gray-300 hover:text-white transition duration-300 ease-in-out cursor-pointer"
          >
            Podsumowanie
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
