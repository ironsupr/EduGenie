# core/firestore_client.py

import os
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from google.cloud import firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from google.oauth2 import service_account
from core.models import LearningPath, ProgressEntry, AssessmentAnalysis
from utils.logger import setup_logger

logger = setup_logger(__name__)

class FirestoreClient:
    """Enhanced Firestore client with authentication and comprehensive CRUD operations."""
    
    def __init__(self, service_account_path: Optional[str] = None, project_id: Optional[str] = None):
        """
        Initialize Firestore client with service account authentication.
        
        Args:
            service_account_path: Path to service account JSON file
            project_id: Google Cloud project ID
        """
        self.project_id = project_id
        self.service_account_path = service_account_path
        
        try:
            if service_account_path and os.path.exists(service_account_path):
                # Authenticate using service account key file
                logger.info(f"Initializing Firestore with service account: {service_account_path}")
                credentials = service_account.Credentials.from_service_account_file(
                    service_account_path
                )
                self.db = firestore.Client(credentials=credentials, project=project_id)
                logger.info(f"Firestore initialized successfully for project: {project_id}")
                
                # Test the connection and initialize collections
                self._test_connection()
                self._initialize_collections()
                
            else:
                # Use default credentials (for GCP environments)
                logger.info("Initializing Firestore with default credentials")
                self.db = firestore.Client(project=project_id)
                logger.info("Firestore initialized with default credentials")
                
                # Test the connection and initialize collections
                self._test_connection()
                self._initialize_collections()
                
        except Exception as e:
            logger.error(f"Failed to initialize Firestore client: {str(e)}")
            raise
    
    def _test_connection(self):
        """Test Firestore connection by attempting a simple operation."""
        try:
            # Try to read from a test collection
            test_ref = self.db.collection('_connection_test').limit(1)
            list(test_ref.stream())  # This will fail if no permissions
            logger.info("Firestore connection test successful")
        except Exception as e:
            logger.error(f"Firestore connection test failed: {str(e)}")
            raise Exception(f"Firestore connection failed. Check IAM permissions for service account. Error: {str(e)}")
    
    def _initialize_collections(self):
        """Initialize required collections with proper structure."""
        try:
            # Collections to initialize
            collections = ['users', 'user_auth', 'user_sessions']
            
            for collection_name in collections:
                # Check if collection exists by trying to get a document
                collection_ref = self.db.collection(collection_name)
                
                # Create a system document to establish the collection
                system_doc_ref = collection_ref.document('_system')
                
                # Check if system document exists
                if not system_doc_ref.get().exists:
                    system_doc_ref.set({
                        'created_at': datetime.utcnow(),
                        'collection_name': collection_name,
                        'purpose': f'System document for {collection_name} collection',
                        'schema_version': '1.0.0'
                    })
                    logger.info(f"Initialized collection: {collection_name}")
                else:
                    logger.info(f"Collection already exists: {collection_name}")
            
            logger.info("All required collections initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize collections: {str(e)}")
            # Don't raise here - collections will be created when first document is added
    
    # CRUD Operations for Students Collection
    
    def create_student(self, student_id: str, student_data: Dict[str, Any]) -> bool:
        """Create a new student document."""
        try:
            # Add metadata
            student_data.update({
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            })
            
            doc_ref = self.db.collection("students").document(student_id)
            doc_ref.set(student_data)
            logger.info(f"Created student: {student_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error creating student {student_id}: {str(e)}")
            return False
    
    def get_student(self, student_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a student document by ID."""
        try:
            doc_ref = self.db.collection("students").document(student_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                data["id"] = doc.id
                logger.info(f"Retrieved student: {student_id}")
                return data
            else:
                logger.warning(f"Student not found: {student_id}")
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving student {student_id}: {str(e)}")
            return None
    
    def update_student(self, student_id: str, updates: Dict[str, Any]) -> bool:
        """Update a student document."""
        try:
            # Add update timestamp
            updates["updated_at"] = datetime.utcnow()
            
            doc_ref = self.db.collection("students").document(student_id)
            doc_ref.update(updates)
            logger.info(f"Updated student: {student_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating student {student_id}: {str(e)}")
            return False
    
    def delete_student(self, student_id: str) -> bool:
        """Delete a student document (soft delete by updating status)."""
        try:
            updates = {
                "status": "deleted",
                "deleted_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            doc_ref = self.db.collection("students").document(student_id)
            doc_ref.update(updates)
            logger.info(f"Soft deleted student: {student_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting student {student_id}: {str(e)}")
            return False
    
    def get_all_students(self, active_only: bool = True) -> List[Dict[str, Any]]:
        """Retrieve all students."""
        try:
            query = self.db.collection("students")
            
            if active_only:
                query = query.where(filter=FieldFilter("status", "==", "active"))
            
            docs = query.stream()
            students = []
            
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                students.append(data)
            
            logger.info(f"Retrieved {len(students)} students")
            return students
            
        except Exception as e:
            logger.error(f"Error retrieving students: {str(e)}")
            return []
    
    # Assessment Operations
    
    def save_assessment(self, student_id: str, answers: Dict[str, Any], analysis: AssessmentAnalysis) -> bool:
        """Save quiz assessment results."""
        try:
            assessment_data = {
                "student_id": student_id,
                "answers": answers,
                "analysis": analysis.dict() if hasattr(analysis, 'dict') else analysis,
                "submitted_at": datetime.utcnow(),
                "score": getattr(analysis, 'score', 0),
                "passed": getattr(analysis, 'passed', False)
            }
            
            # Save to student's assessments subcollection
            doc_ref = self.db.collection("students").document(student_id).collection("assessments").document()
            doc_ref.set(assessment_data)
            
            # Also update student's latest assessment data
            student_updates = {
                "latest_assessment": assessment_data,
                "last_assessment_date": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            self.update_student(student_id, student_updates)
            
            logger.info(f"Saved assessment for student: {student_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving assessment for {student_id}: {str(e)}")
            return False
    
    def get_student_assessments(self, student_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get assessment history for a student."""
        try:
            docs = (self.db.collection("students")
                   .document(student_id)
                   .collection("assessments")
                   .order_by("submitted_at", direction=firestore.Query.DESCENDING)
                   .limit(limit)
                   .stream())
            
            assessments = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                assessments.append(data)
            
            logger.info(f"Retrieved {len(assessments)} assessments for student: {student_id}")
            return assessments
            
        except Exception as e:
            logger.error(f"Error retrieving assessments for {student_id}: {str(e)}")
            return []
    
    # Learning Path Operations
    
    def save_learning_path(self, path: LearningPath) -> bool:
        """Save a learning path."""
        try:
            path_data = path.dict() if hasattr(path, 'dict') else path
            path_data.update({
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            
            doc_ref = self.db.collection("learning_paths").document(path.path_id)
            doc_ref.set(path_data)
            
            logger.info(f"Saved learning path: {path.path_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving learning path {path.path_id}: {str(e)}")
            return False
    
    def get_learning_path(self, path_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a learning path by ID."""
        try:
            doc_ref = self.db.collection("learning_paths").document(path_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                data["id"] = doc.id
                logger.info(f"Retrieved learning path: {path_id}")
                return data
            else:
                logger.warning(f"Learning path not found: {path_id}")
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving learning path {path_id}: {str(e)}")
            return None
    
    def get_student_learning_paths(self, student_id: str) -> List[Dict[str, Any]]:
        """Get all learning paths for a student."""
        try:
            docs = (self.db.collection("learning_paths")
                   .where(filter=FieldFilter("student_id", "==", student_id))
                   .order_by("created_at", direction=firestore.Query.DESCENDING)
                   .stream())
            
            paths = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                paths.append(data)
            
            logger.info(f"Retrieved {len(paths)} learning paths for student: {student_id}")
            return paths
            
        except Exception as e:
            logger.error(f"Error retrieving learning paths for {student_id}: {str(e)}")
            return []
    
    # Progress Tracking Operations
    
    def log_progress(self, entry: ProgressEntry) -> bool:
        """Log a progress entry."""
        try:
            progress_data = entry.dict() if hasattr(entry, 'dict') else entry
            progress_data.update({
                "logged_at": datetime.utcnow()
            })
            
            # Add to student's progress subcollection
            doc_ref = (self.db.collection("students")
                      .document(entry.student_id)
                      .collection("progress")
                      .document())
            doc_ref.set(progress_data)
            
            logger.info(f"Logged progress for student: {entry.student_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error logging progress for {entry.student_id}: {str(e)}")
            return False
    
    def fetch_progress(self, student_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch progress history for a student."""
        try:
            docs = (self.db.collection("students")
                   .document(student_id)
                   .collection("progress")
                   .order_by("logged_at", direction=firestore.Query.DESCENDING)
                   .limit(limit)
                   .stream())
            
            progress = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                progress.append(data)
            
            logger.info(f"Retrieved {len(progress)} progress entries for student: {student_id}")
            return progress
            
        except Exception as e:
            logger.error(f"Error fetching progress for {student_id}: {str(e)}")
            return []
    
    # Lesson Content Operations
    
    def save_lesson_content(self, topic: str, lesson_data: Dict[str, Any]) -> bool:
        """Save lesson content."""
        try:
            content_data = {
                "topic": topic,
                "content": lesson_data,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            }
            
            # Use topic as document ID (sanitized)
            doc_id = topic.lower().replace(" ", "_").replace("-", "_")
            doc_ref = self.db.collection("lesson_content").document(doc_id)
            doc_ref.set(content_data)
            
            logger.info(f"Saved lesson content for topic: {topic}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving lesson content for {topic}: {str(e)}")
            return False
    
    def get_lesson_content(self, topic: str) -> Optional[Dict[str, Any]]:
        """Retrieve lesson content by topic."""
        try:
            doc_id = topic.lower().replace(" ", "_").replace("-", "_")
            doc_ref = self.db.collection("lesson_content").document(doc_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                data["id"] = doc.id
                logger.info(f"Retrieved lesson content for topic: {topic}")
                return data
            else:
                logger.warning(f"Lesson content not found for topic: {topic}")
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving lesson content for {topic}: {str(e)}")
            return None
    
    # Utility Methods
    
    def update_weaknesses(self, student_id: str, weaknesses: List[str]) -> bool:
        """Update student's weakness areas."""
        try:
            updates = {
                "weaknesses": weaknesses,
                "weaknesses_updated_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            return self.update_student(student_id, updates)
            
        except Exception as e:
            logger.error(f"Error updating weaknesses for {student_id}: {str(e)}")
            return False
    
    def set_learning_path(self, student_id: str, plan: List[Dict[str, Any]]) -> bool:
        """Set learning path for a student."""
        try:
            updates = {
                "current_learning_path": plan,
                "learning_path_updated_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            return self.update_student(student_id, updates)
            
        except Exception as e:
            logger.error(f"Error setting learning path for {student_id}: {str(e)}")
            return False
    
    def search_students(self, field: str, value: Any) -> List[Dict[str, Any]]:
        """Search students by field value."""
        try:
            docs = (self.db.collection("students")
                   .where(filter=FieldFilter(field, "==", value))
                   .stream())
            
            students = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                students.append(data)
            
            logger.info(f"Found {len(students)} students matching {field}={value}")
            return students
            
        except Exception as e:
            logger.error(f"Error searching students by {field}={value}: {str(e)}")
            return []
    
    def batch_update_students(self, updates: List[Dict[str, Any]]) -> bool:
        """Batch update multiple students."""
        try:
            batch = self.db.batch()
            
            for update in updates:
                student_id = update.pop("student_id")
                update["updated_at"] = datetime.utcnow()
                
                doc_ref = self.db.collection("students").document(student_id)
                batch.update(doc_ref, update)
            
            batch.commit()
            logger.info(f"Batch updated {len(updates)} students")
            return True
            
        except Exception as e:
            logger.error(f"Error in batch update: {str(e)}")
            return False

    # Generic document operations for authentication
    
    async def create_document(self, collection: str, document_id: str, data: Dict[str, Any]) -> bool:
        """Create a document in the specified collection."""
        try:
            data.update({
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            
            doc_ref = self.db.collection(collection).document(document_id)
            doc_ref.set(data)
            logger.info(f"Created document: {collection}/{document_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error creating document {collection}/{document_id}: {str(e)}")
            return False
    
    async def get_document(self, collection: str, document_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a document by ID."""
        try:
            doc_ref = self.db.collection(collection).document(document_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                data["id"] = doc.id
                logger.info(f"Retrieved document: {collection}/{document_id}")
                return data
            else:
                logger.warning(f"Document not found: {collection}/{document_id}")
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving document {collection}/{document_id}: {str(e)}")
            return None
    
    async def update_document(self, collection: str, document_id: str, updates: Dict[str, Any]) -> bool:
        """Update a document."""
        try:
            updates["updated_at"] = datetime.utcnow()
            
            doc_ref = self.db.collection(collection).document(document_id)
            doc_ref.update(updates)
            logger.info(f"Updated document: {collection}/{document_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating document {collection}/{document_id}: {str(e)}")
            return False
    
    async def delete_document(self, collection: str, document_id: str) -> bool:
        """Delete a document from the specified collection."""
        try:
            doc_ref = self.db.collection(collection).document(document_id)
            doc_ref.delete()
            logger.info(f"Deleted document {document_id} from collection {collection}")
            return True
        except Exception as e:
            logger.error(f"Error deleting document {document_id} from {collection}: {str(e)}")
            return False
    
    async def query_documents(self, collection: str, filters: List[tuple] = None, limit: int = None) -> List[Dict[str, Any]]:
        """Query documents from a collection with optional filters."""
        try:
            query = self.db.collection(collection)
            
            # Apply filters
            if filters:
                for field, operator, value in filters:
                    query = query.where(field, operator, value)
            
            # Apply limit
            if limit:
                query = query.limit(limit)
            
            docs = query.stream()
            results = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                results.append(data)
            
            logger.info(f"Queried {len(results)} documents from collection {collection}")
            return results
            
        except Exception as e:
            logger.error(f"Error querying collection {collection}: {str(e)}")
            return []

    # Synchronous versions for compatibility
    def create_document_sync(self, collection: str, document_id: str, data: Dict[str, Any]) -> bool:
        """Create a document in the specified collection (synchronous)."""
        try:
            doc_ref = self.db.collection(collection).document(document_id)
            doc_ref.set(data)
            logger.info(f"Created document {document_id} in collection {collection}")
            return True
        except Exception as e:
            logger.error(f"Error creating document {document_id} in {collection}: {str(e)}")
            return False
    
    def get_document_sync(self, collection: str, document_id: str) -> Optional[Dict[str, Any]]:
        """Get a document from the specified collection (synchronous)."""
        try:
            doc_ref = self.db.collection(collection).document(document_id)
            doc = doc_ref.get()
            if doc.exists:
                data = doc.to_dict()
                data['id'] = doc.id
                return data
            return None
        except Exception as e:
            logger.error(f"Error getting document {document_id} from {collection}: {str(e)}")
            return None
    
    def delete_document_sync(self, collection: str, document_id: str) -> bool:
        """Delete a document from the specified collection (synchronous)."""
        try:
            doc_ref = self.db.collection(collection).document(document_id)
            doc_ref.delete()
            logger.info(f"Deleted document {document_id} from collection {collection}")
            return True
        except Exception as e:
            logger.error(f"Error deleting document {document_id} from {collection}: {str(e)}")
            return False

    def update_document_sync(self, collection: str, document_id: str, data: Dict[str, Any]) -> bool:
        """Update a document in the specified collection (synchronous)."""
        try:
            doc_ref = self.db.collection(collection).document(document_id)
            doc_ref.update(data)
            logger.info(f"Updated document {document_id} in collection {collection}")
            return True
        except Exception as e:
            logger.error(f"Error updating document {document_id} in {collection}: {str(e)}")
            return False
    
    def query_documents_sync(self, collection: str, filters: List[tuple] = None, limit: int = None) -> List[Dict[str, Any]]:
        """Query documents from a collection with optional filters (synchronous)."""
        try:
            query = self.db.collection(collection)
            
            # Apply filters
            if filters:
                for field, operator, value in filters:
                    query = query.where(field, operator, value)
            
            # Apply limit
            if limit:
                query = query.limit(limit)
            
            docs = query.stream()
            results = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                results.append(data)
            
            logger.info(f"Queried {len(results)} documents from collection {collection}")
            return results
            
        except Exception as e:
            logger.error(f"Error querying collection {collection}: {str(e)}")
            return []

    # Alias methods for backward compatibility
    def create_document(self, collection: str, document_id: str, data: Dict[str, Any]) -> bool:
        """Create a document (backward compatibility)."""
        return self.create_document_sync(collection, document_id, data)
    
    def get_document(self, collection: str, document_id: str) -> Optional[Dict[str, Any]]:
        """Get a document (backward compatibility)."""
        return self.get_document_sync(collection, document_id)
    
    def delete_document(self, collection: str, document_id: str) -> bool:
        """Delete a document (backward compatibility)."""
        return self.delete_document_sync(collection, document_id)

    # Async versions that delegate to sync methods
    async def create_document_async(self, collection: str, document_id: str, data: Dict[str, Any]) -> bool:
        """Create a document in the specified collection (async)."""
        return self.create_document_sync(collection, document_id, data)
    
    async def get_document_async(self, collection: str, document_id: str) -> Optional[Dict[str, Any]]:
        """Get a document from the specified collection (async)."""
        return self.get_document_sync(collection, document_id)
    
    async def update_document_async(self, collection: str, document_id: str, data: Dict[str, Any]) -> bool:
        """Update a document in the specified collection (async)."""
        return self.update_document_sync(collection, document_id, data)
    
    async def delete_document_async(self, collection: str, document_id: str) -> bool:
        """Delete a document from the specified collection (async)."""
        return self.delete_document_sync(collection, document_id)
    
    async def query_documents_async(self, collection: str, filters: List[tuple] = None, limit: int = None) -> List[Dict[str, Any]]:
        """Query documents from a collection with optional filters (async)."""
        return self.query_documents_sync(collection, filters, limit)

# Global instance
_firestore_client = None

def get_firestore_client(service_account_path: Optional[str] = None, project_id: Optional[str] = None) -> FirestoreClient:
    """Get or create global Firestore client instance."""
    global _firestore_client
    
    if _firestore_client is None:
        _firestore_client = FirestoreClient(service_account_path, project_id)
    
    return _firestore_client
