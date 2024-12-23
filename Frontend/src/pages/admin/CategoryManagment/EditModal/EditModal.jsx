import React,{useState,useEffect} from 'react'
import './EditModal.css'

const EditCategoryModal=({isOpen,onClose,categoryName,onSave}) =>{
  const [newName,setNewName]=useState(categoryName);

  useEffect(()=>{
    setNewName(categoryName)
  },[categoryName])

  if(!isOpen) return null;

  const handleSave=()=>{
    if(newName.trim()===''){
        alert('Category name is required')
        return
    }
    onSave(newName)
  }

  return (
    <div className="modal-overlay">
    <div className="modal-content">
      <h2>Edit Category</h2>
      <input
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
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

export default EditCategoryModal