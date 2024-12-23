import React,{useState} from "react"

const addCategoryModal=({isOpen,onClose,onSave})=>{
   const [newCategoryName,setNewCategoryName]=useState('')

   const handleSave=(e)=>{
    e.preventDefault()
    if(newCategoryName.trim()){
      onSave(newCategoryName);
      setNewCategoryName('')
    }else{
      alert('Category name is required')
    }
   }

  if(!isOpen) return null

    return (
        <div className="modal-overlay">
        <div className="modal-content">
          <h2>Edit Category</h2>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Enter new category name"
          />
          <div className="modal-actions">
            <button onClick={handleSave}>Save</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
      )
 }
 export default addCategoryModal
