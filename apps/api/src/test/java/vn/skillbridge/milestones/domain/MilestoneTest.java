package vn.skillbridge.milestones.domain;

import static org.assertj.core.api.Assertions.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class MilestoneTest {
    private Milestone milestone(){return new Milestone(UUID.randomUUID(),"p-test","plan",1,"Delivery",1000000,LocalDate.now(),List.of(new Milestone.Criterion("c1","Form")),Milestone.Status.IN_PROGRESS,Milestone.Funding.PENDING_FUNDING,0);}
    @Test void requiresCurrentRevisionAndReasonAndPreservesCriteriaAcrossResubmission(){
        var initial=milestone();var submitted=initial.submit(0);
        assertThatThrownBy(()->submitted.submit(1)).isInstanceOf(MilestoneViolation.class);
        assertThatThrownBy(()->submitted.decide(0,true,null)).isInstanceOf(MilestoneViolation.class);
        assertThatThrownBy(()->submitted.decide(1,false," ")).isInstanceOf(MilestoneViolation.class);
        var second=submitted.decide(1,false,"Add evidence").submit(1);
        assertThat(second.revision()).isEqualTo(2);assertThat(second.criteria()).isEqualTo(initial.criteria());
    }
    @Test void simulatedReleaseRequiresFundingAndHumanAcceptance(){
        var m=milestone();assertThatThrownBy(()->m.fund(Milestone.Funding.RELEASED)).isInstanceOf(MilestoneViolation.class);
        var funded=m.fund(Milestone.Funding.FUNDED);
        assertThatThrownBy(()->funded.fund(Milestone.Funding.RELEASED)).isInstanceOf(MilestoneViolation.class);
        assertThat(funded.submit(0).decide(1,true,null).fund(Milestone.Funding.RELEASED).funding()).isEqualTo(Milestone.Funding.RELEASED);
    }
}
