# Admin Term Publishing System - Implementation TODO

## Overview
Implement a system where admins control when exams and reports become available to students for each academic term. Even if teachers create exams, students cannot access them until the admin publishes the term.

## Database Schema Changes

### High Priority
- [ ] **Add Term Management Table**
  - [ ] Create `AcademicTerm` model
    - [ ] `id` (String, Primary Key)
    - [ ] `name` (String) - "FIRST_TERM", "SECOND_TERM", "THIRD_TERM"
    - [ ] `year` (String) - "2024/2025"
    - [ ] `startDate` (DateTime)
    - [ ] `endDate` (DateTime)
    - [ ] `isActive` (Boolean) - Current active term
    - [ ] `isPublished` (Boolean) - Students can access exams/reports
    - [ ] `publishedAt` (DateTime, Optional)
    - [ ] `publishedBy` (String, Optional) - Admin user ID
    - [ ] `createdAt` (DateTime)
    - [ ] `updatedAt` (DateTime)

- [ ] **Update Exam Model**
  - [ ] Add `termId` (String, Optional) - Foreign key to AcademicTerm
  - [ ] Add `isPublished` (Boolean, Default: false)
  - [ ] Add relation to AcademicTerm

- [ ] **Update Attempt Model**
  - [ ] Ensure proper relation to updated Exam model

## Backend API Development

### High Priority
- [x] **Term Management APIs**
  - [x] `GET /api/admin/terms` - List all terms
  - [x] `POST /api/admin/terms` - Create new term
  - [x] `PUT /api/admin/terms/[id]` - Update term
  - [x] `DELETE /api/admin/terms/[id]` - Delete term
  - [x] `POST /api/admin/terms/[id]/publish` - Publish term
  - [ ] `POST /api/admin/terms/[id]/unpublish` - Unpublish term
  - [ ] `POST /api/admin/terms/[id]/activate` - Set as active term

- [x] **Updated Exam APIs**
  - [x] Modify `GET /api/student/exams` - Only show published term exams
  - [x] Modify `POST /api/exams` - Associate with current active term
  - [ ] Add term filtering to all exam endpoints

- [x] **Updated Report APIs**
  - [x] Modify `GET /api/reports/student/[id]` - Check term publication status
  - [x] Return appropriate error for unpublished terms

### Medium Priority
- [ ] **Bulk Operations APIs**
  - [ ] `POST /api/admin/terms/bulk-publish` - Publish multiple terms
  - [ ] `POST /api/admin/exams/bulk-assign-term` - Assign exams to terms

## Frontend Development

### High Priority
- [ ] **Admin Term Management Page** (`/admin/terms`)
  - [ ] Term list with status indicators
  - [ ] Create new term form
  - [ ] Edit term details
  - [ ] Publish/Unpublish toggle buttons
  - [ ] Set active term functionality
  - [ ] Term statistics (exams count, students count)

- [x] **Admin Dashboard Integration**
  - [x] Add term management card/section
  - [x] Quick publish/unpublish actions
  - [x] Current active term display
  - [ ] Pending publications alerts

- [x] **Exam Management Updates**
  - [x] Add term selection when creating exams
  - [x] Display term info in exam lists
  - [ ] Filter exams by term
  - [ ] Bulk term assignment for existing exams

### Medium Priority
- [ ] **Student Interface Updates**
  - [ ] Show term publication status in exam lists
  - [ ] Display "Coming Soon" for unpublished terms
  - [ ] Term-based navigation in reports
  - [ ] Notification when new term is published

- [ ] **Teacher Interface Updates**
  - [ ] Term selection in exam creation
  - [ ] View term publication status
  - [ ] Notification about term publishing

## Access Control & Permissions

### High Priority
- [x] **Student Access Control**
  - [x] Block access to unpublished term exams
  - [x] Block access to unpublished term reports
  - [x] Show appropriate messages for restricted content

- [x] **Teacher Access Control**
  - [x] Allow exam creation for any term
  - [x] Show publication status in teacher views
  - [ ] Restrict student result viewing to published terms

- [ ] **Admin Access Control**
  - [ ] Full access to all terms and exams
  - [ ] Term publishing permissions
  - [ ] Audit trail for publishing actions

## User Experience Enhancements

### High Priority
- [ ] **Status Indicators**
  - [ ] Published/Unpublished badges
  - [ ] Active term highlighting
  - [ ] Publication date display

- [ ] **Notifications**
  - [ ] Email notifications when term is published
  - [ ] In-app notifications for students
  - [ ] Admin notifications for pending publications

### Medium Priority
- [ ] **Bulk Actions**
  - [ ] Select multiple terms for bulk operations
  - [ ] Bulk exam assignment to terms
  - [ ] Batch student notifications

## Data Migration & Seeding

### High Priority
- [ ] **Migration Scripts**
  - [ ] Create initial academic terms
  - [ ] Assign existing exams to appropriate terms
  - [ ] Set default publication status

- [ ] **Seed Data**
  - [ ] Create sample academic terms
  - [ ] Set up default term structure
  - [ ] Assign proper permissions

## Testing & Validation

### High Priority
- [ ] **API Testing**
  - [ ] Term CRUD operations
  - [ ] Publication workflow testing
  - [ ] Access control validation

- [ ] **Frontend Testing**
  - [ ] Term management interface
  - [ ] Student access restrictions
  - [ ] Admin publishing workflow

### Medium Priority
- [ ] **Integration Testing**
  - [ ] End-to-end term publishing flow
  - [ ] Student exam access after publishing
  - [ ] Report generation with term controls

## Security & Audit

### High Priority
- [ ] **Audit Logging**
  - [ ] Log all term publishing actions
  - [ ] Track admin actions with timestamps
  - [ ] Student access attempt logging

- [ ] **Security Measures**
  - [ ] Validate admin permissions for publishing
  - [ ] Prevent unauthorized term access
  - [ ] Rate limiting for publishing actions

## Documentation

### Medium Priority
- [ ] **Admin Documentation**
  - [ ] Term management guide
  - [ ] Publishing workflow documentation
  - [ ] Troubleshooting guide

- [ ] **API Documentation**
  - [ ] Term management endpoints
  - [ ] Updated exam/report endpoints
  - [ ] Access control specifications

## Implementation Phases

### Phase 1 (Week 1)
- Database schema changes
- Basic term management APIs
- Admin term management page

### Phase 2 (Week 2)
- Exam-term association
- Student access control
- Publishing workflow

### Phase 3 (Week 3)
- Report integration
- Notifications system
- Bulk operations

### Phase 4 (Week 4)
- Testing and validation
- Documentation
- Performance optimization

## Success Criteria
- [ ] Admins can create and manage academic terms
- [ ] Admins can publish/unpublish terms independently
- [ ] Students cannot access unpublished term content
- [ ] Teachers can create exams but students see them only after admin publishes
- [ ] Proper audit trail for all publishing actions
- [ ] Seamless user experience with clear status indicators

## Notes
- Ensure backward compatibility with existing exams
- Consider timezone handling for term dates
- Plan for academic year rollover functionality
- Design for scalability with multiple academic years