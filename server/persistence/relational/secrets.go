package relational

import (
	"fmt"

	"github.com/jinzhu/gorm"
	"github.com/offen/offen/server/persistence"
)

func (r *relationalDAL) CreateSecret(s *persistence.Secret) error {
	local := importSecret(s)
	if err := r.db.Create(&local).Error; err != nil {
		return fmt.Errorf("relational: error creating secret: %w", err)
	}
	return nil
}

func (r *relationalDAL) DeleteSecret(q interface{}) error {
	switch query := q.(type) {
	case persistence.DeleteSecretQueryBySecretID:
		if err := r.db.Where("secret_id = ?", string(query)).Delete(&Secret{}).Error; err != nil {
			return fmt.Errorf("relational: error deleting secret: %w", err)
		}
		return nil
	default:
		return persistence.ErrBadQuery
	}
}

func (r *relationalDAL) FindSecret(q interface{}) (persistence.Secret, error) {
	var secret Secret
	switch query := q.(type) {
	case persistence.FindSecretQueryBySecretID:
		if err := r.db.Where(
			"secret_id = ?",
			string(query),
		).First(&secret).Error; err != nil {
			if gorm.IsRecordNotFoundError(err) {
				return secret.export(), persistence.ErrUnknownSecret("relational: no matching secret found")
			}
			return secret.export(), fmt.Errorf("relational: error looking up secret: %w", err)
		}
		return secret.export(), nil
	default:
		return secret.export(), persistence.ErrBadQuery
	}
}