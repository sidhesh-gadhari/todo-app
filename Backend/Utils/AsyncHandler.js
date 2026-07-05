//Promise method
const asyncHandler = (requestHandler) =>
{
 return (req, res, next) =>
 {
  Promise.resolve(requestHandler(req, res, next)).catch((e)=>{next(e)});  
 }   
}

//Try-Catch method
// const asyncHandler = (func) => async (req, res, next) =>
// {
//  try 
//  {
//   await func(req, res, next);  
//  } 
//  catch(e) 
//  {
//   console.log(e);
//   next(e);   
//  }   
// }

module.exports = asyncHandler;