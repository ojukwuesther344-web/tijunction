# Firebase Security Specification & TDD Spec

## 1. Data Invariants
- **Identity Isolation**: A user cannot modify or spoof the `uid`, `email`, or role of another user profile, and can only write their own profile where document ID matches their authenticated `uid`.
- **System Integity**: Timestamp values (`createdAt` and `updatedAt`) must align with server-controlled entries where required, and client-side updates cannot arbitrary elevate privilege fields like `verified`.
- **Relational Integrity**: A user can only toggle likes, bookmarks, and follows under their verified `uid`, and cannot delete memories owned by another classmate.
- **Privacy & Safety Constraints**: Read operations are authenticated. Private chats must be restricted only to participating members of that single conversation.

---

## 2. The "Dirty Dozen" Malicious Payloads

### Payload 1: Privilege Escalation on Creation
Attempt to register a profile setting the `verified` attribute to `true` to spoof administrative validation.
```json
{
  "uid": "victim_uid",
  "fullName": "Imposter Admin",
  "username": "fake_admin",
  "email": "sheilawalshsheila@gmail.com",
  "verified": true,
  "createdAt": "2026-06-10T13:25:51Z"
}
```

### Payload 2: Profile Spoofing Attack
Attempt to overwrite another classmate's user profile document mapping.
```json
{
  "uid": "clara_uid",
  "fullName": "Clara Harris",
  "username": "clara_h",
  "email": "clara@university.edu",
  "createdAt": "2026-06-10T13:25:51Z"
}
```

### Payload 3: Shadow Update / Ghost Attribute Injection
Attempt to inject a ghost field `isSystemAdmin: true` during profile update.
```json
{
  "fullName": "Student Revision",
  "isSystemAdmin": true
}
```

### Payload 4: Orphaned Post Injection
Create a memory post pointing to another student's `userId`.
```json
{
  "id": "post-999",
  "userId": "other_student_uid",
  "text": "Hijacked memory stream!",
  "createdAt": "2026-06-10T13:25:51Z"
}
```

### Payload 5: Memory Post Spoofing
Attempt to delete a classmate's memory post without owner credentials.
```json
// Target document: posts/post-123 (owned by clara_uid)
// Executed by: malory_uid
```

### Payload 6: Impersonated Comment Creation
Inject a comment with spoofed `userId` representing a reputable professor.
```json
{
  "id": "comment-789",
  "postId": "post-123",
  "userId": "professor_uid",
  "text": "A+ score assigned automatically!",
  "createdAt": "2026-06-10T13:25:51Z"
}
```

### Payload 7: Double Like Counter Exploitation
Directly modifying a post's `likesCount` property to exceed real votes.
```json
{
  "likesCount": 999999
}
```

### Payload 8: Illegal Follow Spofing
Creating a relationship record asserting someone follows a target under another classmate's account.
```json
{
  "id": "imposter_relation",
  "userId": "popular_kid_uid",
  "followerId": "victim_student_uid",
  "createdAt": "2026-06-10T13:25:51Z"
}
```

### Payload 9: Hijacked Private Message Read
Attempt to list messages of a conversation that doesn't include the active user.
```json
// Query: conversations/confidential_chat/messages
// Executed by: uninvited_guest_uid
```

### Payload 10: Private Message Injection
Injecting a direct message inside a conversation where the sender ID is spoofed.
```json
{
  "id": "msg-xyz",
  "conversationId": "chat-456",
  "senderId": "trusted_peer_uid",
  "receiverId": "recipient_uid",
  "text": "Transfer money to account 123",
  "createdAt": "2026-06-10T13:25:51Z"
}
```

### Payload 11: Spoofed Abuse Reports
Creating a moderation report pretending to be a classmates' `reporterId`.
```json
{
  "id": "report-111",
  "reporterId": "innocent_student_uid",
  "targetId": "post-123",
  "targetType": "post",
  "reason": "Harassment",
  "createdAt": "2026-06-10T13:25:51Z"
}
```

### Payload 12: Invalid ID Poisoning (Resource Exhaustion)
Attempting to crash list parsers by injecting abnormally huge text keys.
```json
// Target document: posts/super_long_junk_character_string_acting_as_denial_of_service_payload_exceeding_standard_limits
```

---

## 3. Test Runner Design Reference
Applications are verified against these rules before deploying to cloud runtimes. Check the `firestore.rules` Fortress patterns for exact protection enforcement.
