import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLinkClick = (route: string) => {
    navigate(route, { state: { from: location.pathname } });
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
            className="text-gray-300 hover:text-white transition duration-300 ease-in-out cursor-pointer"
          >
            Home
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={() => handleLinkClick('/payments')}
            className="text-gray-300 hover:text-white transition duration-300 ease-in-out cursor-pointer"
          >
            Payments
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={() => handleLinkClick('/summary')}
            className="text-gray-300 hover:text-white transition duration-300 ease-in-out cursor-pointer"
          >
            Summary
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
