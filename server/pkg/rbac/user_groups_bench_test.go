package rbac

import (
	"testing"

	"github.com/cortezaproject/corteza/server/pkg/id"
	"go.uber.org/zap"
)

func BenchmarkBuildOrgTree(b *testing.B) {
	bits := []GroupMembers{
		{
			group: &groupNode{
				id:     id.MustNumID(1),
				handle: "1",
			},
		},
		{
			group: &groupNode{
				id:     id.MustNumID(2),
				handle: "2",
				paths:  mkPp(id.MustNumID(1)),
			},
		},
		{
			group: &groupNode{
				id:     id.MustNumID(3),
				handle: "3",
				paths:  mkPp(id.MustNumID(1)),
			},
		},
		{
			group: &groupNode{
				id:     id.MustNumID(4),
				handle: "4",
				paths:  mkPp(id.MustNumID(1)),
			},
		},
		{
			group: &groupNode{
				id:     id.MustNumID(5),
				handle: "5",
				paths:  mkPp(id.MustNumID(1)),
			},
		},
		{
			group: &groupNode{
				id:     id.MustNumID(6),
				handle: "6",
				paths:  mkPp(id.MustNumID(1)),
			},
		},

		{
			group: &groupNode{
				id:     id.MustNumID(7),
				handle: "7",
				paths:  mkPp(id.MustNumID(2)),
			},
		},
		{
			group: &groupNode{
				id:     id.MustNumID(8),
				handle: "8",
				paths:  mkPp(id.MustNumID(3)),
			},
		},
	}

	svc := &orgTree{logger: zap.NewNop()}

	b.ResetTimer()
	for n := 0; n < b.N; n++ {
		err := svc.Rebuild(bits...)
		if err != nil {
			panic(err)
		}
	}
}
