const bookModel= require("../Models/BooksModel")
const UserModel = require("../Models/UserModel")
const {body,isValidObjectId,isValidISBN, validation} = require("../middleware/validation");
const BooksModel = require("../Models/BooksModel");
const valid=require("validator")



let createBook= async function(req,res){
    
    try{
        let data= req.body
        if(!body(data)) return res.status(400).send({status:false,msg:"Input is Missing "})
        
        if(!validation(data.userId))return res.status(400).send({status:false,msg:"userId is mandatory "})
        const validUser= await UserModel.findById(data.userId)
        if(!validUser) return res.status(400).send({status:false,msg:"user not found"})
        if(!validation(data.title)) return res.status(400).send({status:false,msg:"title is mandatory"})

        let UniqueTitle =await BooksModel.findOne({title:data.title})
        if(UniqueTitle) return res.status(400).send({status:false,msg:"title  Must me Unique"})
        
        if(!(data.releasedAt))  return res.status(400).send({status:false,msg:"ReleaseDate is mandatory"})
        
        
        if(!isValidISBN(data.ISBN)) return res.status(400).send({status:false,msg:"ISBN should be of 13 digits"})
        let UniqueISBN =await BooksModel.findOne({ISBN:data.ISBN})
        
        if(UniqueISBN) return res.status(400).send({status:false,msg:" ISBN Must me Unique"})

        if(!(data.releasedAt))  return res.status(400).send({status:false,msg:"ReleaseDate is mandatory"})
         if(!valid.isDate(data.releasedAt))  return res.status(400).send({status:false,msg:"ReleaseDAte is not valid"})
        if(!validation(data.excerpt))  return res.status(400).send({status:false,msg:"excerpt is required"})
        if(!validation(data.category))  return res.status(400).send({status:false,msg:"category is required"})
        if(!validation(data.subcategory))  return res.status(400).send({status:false,msg:"subcategory is required"})

        let savedUser= await bookModel.create(data)

        return res.status(201).send({status:true,msg:"book created successfully",data:savedUser})

    }catch(error){
        return res.status(500).send(error.message)
    }
}




const getBooks=async (req,res)=>{
    try {
        let queryParams = req.query

        const filterCondition = { isDeleted: false, deletedAt: null };
        if (body(queryParams)) {
            const { userId, category, subcategory } = queryParams;

            if (queryParams.hasOwnProperty("userId")) {
                if (!isValidObjectId(userId)) {
                    return res
                        .status(400)
                        .send({ status: false, message: "Enter a valid userId" });
                }
                const userByUserId = await UserModel.findById(userId);

                if (!userByUserId) {
                    return res
                        .status(400)
                        .send({ status: false, message: "no user found" })
                }
                filterCondition["userId"] = userId;
            }
            if (queryParams.hasOwnProperty("category")) {
                if (!validation(category)) {
                    return res.status(400).send({ status: false, message: "book category should be in valid format" });
                }
                filterCondition["category"] = category.trim();
            }
            if (queryParams.hasOwnProperty("subcategory")) {
                if (!validation(subcategory)) {
                    return res.status(400).send({ status: false, message: "book subcategory should be in valid format" });
                }
                        
                        filterCondition["subcategory"] = subcategory.trim();
              
            }
            const filetredBooks = await BooksModel.find(filterCondition).sort({"data.title":1})

            if (filetredBooks.length == 0) {
                return res
                    .status(404)
                    .send({ status: false, message: "no books found" });
            }

            res
                .status(200)
                .send({ status: true, message: "filtered blog list", blogsCounts: filetredBooks.length, bookList: filetredBooks })


        } else {
            const allBooks = await BooksModel.find(filterCondition).sort({title:1})

            if (allBooks.length == 0) {
                return res
                    .status(404)
                    .send({ status: false, message: "no books found" })
            }
            res
                .status(200)
                .send({ status: true, message: "book list", booksCount: allBooks.length, booksList: allBooks.sort()});
        }

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}


    const getBookById= async function(req, res){
        try{
             let bookId=req.params.bookId
     if(!bookId) return res.status(400).send({status:false, msg: "BookId is required"})
     if(!isValidObjectId(bookId))
     return res.status(400).send({status:false, msg: "BookId is notValid"})
    let getData = await BooksModel.findById({_id:bookId, isDeleted:false})
    if (!getData) return res.status(404).send({status:false, msg: "Data not found"})
    
     return res.status(200).send({status:true, msg:"Data found", data:getData})
    
        }catch(error){
            return res.status(500).send(error.message)
        }
    }
    

const UpdateBooks=async (req,res)=>{
try {
let Book=req.params.bookId

let Update=await BooksModel.findById(Book)
if(Update.isDeleted==true) return res.status(400).send({status:false,msg:"data not found"})
    
let data=req.body
if(!body(data)) return res.status(400).send({status:false,msg:"Input is Missing"})

let UniqueTitle =await BooksModel.findOne({title:data.title})
if(UniqueTitle) return res.status(400).send({status:false,msg:"title  Must me Unique"})

if(!(data.releasedAt))  return res.status(400).send({status:false,msg:"ReleaseDate is mandatory"})


if(!isValidISBN(data.ISBN)) return res.status(400).send({status:false,msg:"ISBN should be of 13 digits"})
let UniqueISBN =await BooksModel.findOne({ISBN:data.ISBN})

if(UniqueISBN) return res.status(400).send({status:false,msg:" ISBN Must me Unique"})

let Updatebook=await BooksModel.findByIdAndUpdate({_id:Book},data,{new:true})
return res.status(200).send({status:true,msg:"Updated Successfully",data:Updatebook})

} catch (error) {
    return res.status(500).send({msg:error.message})
    
}


}



const deleteBooks = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!bookId) return res.status(400).send({ status: false, msg: "BookId is required" })

        if (!isValidObjectId(bookId))
            return res.status(400).send({ status: false, msg: "BookId is not Valid" })

        const findbook = await BooksModel.findById(bookId)

        if (findbook.isDeleted == true) return res.status(404).send({ status: false, msg: "data is already deleted" })

        let DeletedBook = await BooksModel.findByIdAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: new Date() } })

        return res.status(200).send({ status: true, data: " Book Deleted successfully " })
    }
    catch (err) {
        console.log(err.message)
        res.status(500).send({ status: false, msg: err.message })
    }


};
module.exports = { createBook, getBookById, getBooks, deleteBooks,UpdateBooks }

