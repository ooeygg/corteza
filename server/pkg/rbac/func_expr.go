package rbac

import (
	"github.com/PaesslerAG/gval"
	"github.com/cortezaproject/corteza/server/pkg/id"
	"github.com/spf13/cast"
)

func AllFunctions() []gval.Language {
	return []gval.Language{
		gval.Function("isDescendantOf", isDescendantOf),
		gval.Function("isDescendantOfR", isDescendantOfR),
		gval.Function("isDescendantOfW", isDescendantOfW),
		gval.Function("isDescendantOfRW", isDescendantOfRW),
	}
}

func isDescendantOf(userID any, resourceOwner any, paths ...string) bool {
	if gRBAC == nil {
		return false
	}

	owner := id.MustNumID(cast.ToUint64(resourceOwner))
	if owner.IsZero() {
		return false
	}

	user := id.MustNumID(cast.ToUint64(cast.ToString(userID)))
	if user.IsZero() {
		return false
	}

	out := gRBAC.orgTree.IsAbove(owner, user, paths...)
	return out
}

func isDescendantOfR(userID any, resourceOwner any) bool {
	return isDescendantOf(userID, resourceOwner, "read")
}

func isDescendantOfW(userID any, resourceOwner any) bool {
	return isDescendantOf(userID, resourceOwner, "write")
}

func isDescendantOfRW(userID any, resourceOwner any) bool {
	return isDescendantOf(userID, resourceOwner, "read", "write")
}
