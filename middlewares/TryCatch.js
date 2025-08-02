// const TryCatch = (handler) => {
//   return async (req, res, next) => {
//     try {
//       await handler(req, res, next);
//     } catch (error) {
//       res.status(500).json({
//         message: error.message,
//       });
//     }
//   };
// };

// export default TryCatch;



const TryCatch = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      // THIS IS THE LINE YOU MUST ADD
      console.error("AN ERROR OCCURRED:", error);

      res.status(500).json({
        message: error.message,
      });
    }
  };
};

export default TryCatch;
